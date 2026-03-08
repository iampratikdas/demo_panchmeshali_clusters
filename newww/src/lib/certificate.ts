/**
 * generateCertificate
 * Draws a participation / ranking certificate onto an off-screen Canvas
 * and triggers a PNG download for the user.
 *
 * All fields match the API payload shape:
 *   { writerName, competitionName, editorName, participantName, logoUrl, position }
 */
export interface CertificateOptions {
    writerName: string;
    competitionName: string;
    /** editorName is the team array from the event */
    editorName: string[];
    participantName: string;
    logoUrl: string;
    /** numeric rank: 1 → Gold, 2 → Silver, 3 → Bronze, else → Participant */
    position: number;
}

function ordinal(n: number): string {
    if (n === 1) return '1st';
    if (n === 2) return '2nd';
    if (n === 3) return '3rd';
    return `${n}th`;
}

function medalColor(position: number): { badge: string; text: string; rim: string } {
    if (position === 1) return { badge: '#FFD700', text: '#7A5000', rim: '#FFA500' };
    if (position === 2) return { badge: '#C0C0C0', text: '#444', rim: '#808080' };
    if (position === 3) return { badge: '#CD7F32', text: '#5A2D00', rim: '#8B4513' };
    return { badge: '#6366F1', text: '#fff', rim: '#4338CA' };
}

function wrapText(
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number
): number {
    const words = text.split(' ');
    let line = '';
    let curY = y;
    for (const word of words) {
        const test = line ? `${line} ${word}` : word;
        if (ctx.measureText(test).width > maxWidth && line) {
            ctx.fillText(line, x, curY);
            line = word;
            curY += lineHeight;
        } else {
            line = test;
        }
    }
    if (line) ctx.fillText(line, x, curY);
    return curY;
}

export async function generateCertificate(opts: CertificateOptions): Promise<void> {
    const W = 1122, H = 794; // A4 landscape @ 96dpi
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d')!;

    const colors = medalColor(opts.position);
    const isWinner = opts.position <= 3;
    const posLabel = isWinner ? `${ordinal(opts.position)} Place` : 'Participant';

    /* ── Background gradient ── */
    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, '#fdf6ec');
    bg.addColorStop(1, '#fffdf5');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    /* ── Outer decorative border ── */
    const borderGrad = ctx.createLinearGradient(0, 0, W, H);
    borderGrad.addColorStop(0, '#c9a84c');
    borderGrad.addColorStop(0.5, '#f5d78e');
    borderGrad.addColorStop(1, '#c9a84c');
    ctx.strokeStyle = borderGrad;
    ctx.lineWidth = 14;
    ctx.strokeRect(14, 14, W - 28, H - 28);

    ctx.strokeStyle = '#e6c84a';
    ctx.lineWidth = 3;
    ctx.strokeRect(26, 26, W - 52, H - 52);

    /* ── Corner ornaments ── */
    const corners = [[36, 36], [W - 36, 36], [36, H - 36], [W - 36, H - 36]];
    corners.forEach(([cx, cy]) => {
        ctx.beginPath();
        ctx.arc(cx, cy, 14, 0, Math.PI * 2);
        ctx.fillStyle = '#c9a84c';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cx, cy, 8, 0, Math.PI * 2);
        ctx.fillStyle = '#fdf6ec';
        ctx.fill();
    });

    /* ── Logo (async load) ── */
    let logoLoaded = false;
    const logo = new Image();
    logo.crossOrigin = 'anonymous';

    await new Promise<void>(resolve => {
        logo.onload = () => { logoLoaded = true; resolve(); };
        logo.onerror = () => resolve();
        logo.src = opts.logoUrl;
        setTimeout(resolve, 3000); // fallback timeout
    });

    if (logoLoaded) {
        const lSize = 72;
        ctx.save();
        ctx.beginPath();
        ctx.arc(W / 2, 82, lSize / 2, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(logo, W / 2 - lSize / 2, 82 - lSize / 2, lSize, lSize);
        ctx.restore();

        ctx.beginPath();
        ctx.arc(W / 2, 82, lSize / 2 + 4, 0, Math.PI * 2);
        ctx.strokeStyle = '#c9a84c';
        ctx.lineWidth = 3;
        ctx.stroke();
    }

    /* ── "Certificate of" heading ── */
    ctx.textAlign = 'center';
    ctx.fillStyle = '#7a5a00';
    ctx.font = 'italic 18px Georgia, serif';
    ctx.fillText('Certificate of', W / 2, 136);

    /* ── Achievement type ── */
    ctx.font = 'bold 42px Georgia, serif';
    ctx.fillStyle = isWinner ? colors.text : '#3730a3';
    ctx.fillText(isWinner ? 'Achievement' : 'Participation', W / 2, 186);

    /* ── Decorative rule ── */
    const ruleGrad = ctx.createLinearGradient(W / 2 - 200, 0, W / 2 + 200, 0);
    ruleGrad.addColorStop(0, 'transparent');
    ruleGrad.addColorStop(0.5, '#c9a84c');
    ruleGrad.addColorStop(1, 'transparent');
    ctx.strokeStyle = ruleGrad;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(W / 2 - 200, 200); ctx.lineTo(W / 2 + 200, 200);
    ctx.stroke();

    /* ── "This is to certify that" ── */
    ctx.font = '18px Georgia, serif';
    ctx.fillStyle = '#555';
    ctx.fillText('This is to certify that', W / 2, 236);

    /* ── Participant name ── */
    ctx.font = 'bold 48px Georgia, serif';
    ctx.fillStyle = '#2e1a00';
    ctx.fillText(opts.participantName, W / 2, 294);

    /* ── Underline under name ── */
    const nameW = ctx.measureText(opts.participantName).width;
    ctx.beginPath();
    ctx.moveTo(W / 2 - nameW / 2, 304);
    ctx.lineTo(W / 2 + nameW / 2, 304);
    ctx.strokeStyle = '#c9a84c';
    ctx.lineWidth = 2;
    ctx.stroke();

    /* ── "has participated in" ── */
    ctx.font = '18px Georgia, serif';
    ctx.fillStyle = '#555';
    ctx.fillText('has participated in', W / 2, 340);

    /* ── Competition name (wrapped) ── */
    ctx.font = 'bold 30px Georgia, serif';
    ctx.fillStyle = '#1e3a5f';
    wrapText(ctx, opts.competitionName, W / 2, 378, W - 200, 40);

    /* ── Position badge ── */
    const badgeX = W / 2 - 64, badgeY = isWinner ? 426 : 436;
    const badgeW = 128, badgeH = 44;
    const badgeR = 22;

    // Rounded rect helper
    const roundRect = (x: number, y: number, w: number, h: number, r: number) => {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
    };

    roundRect(badgeX, badgeY, badgeW, badgeH, badgeR);
    ctx.fillStyle = colors.badge;
    ctx.fill();
    ctx.strokeStyle = colors.rim;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = colors.text;
    ctx.font = 'bold 20px Georgia, serif';
    ctx.fillText(posLabel, W / 2, badgeY + 30);

    /* ── Bottom divider ── */
    ctx.strokeStyle = ruleGrad;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(50, 530); ctx.lineTo(W - 50, 530);
    ctx.stroke();

    /* ── Editor / Team signatures ── */
    const team = opts.editorName.slice(0, 4); // cap at 4
    const slotW = (W - 100) / Math.max(team.length, 1);
    const sigY = 700;

    team.forEach((editor, i) => {
        const cx = 50 + slotW * i + slotW / 2;
        // Signature line
        ctx.beginPath();
        ctx.moveTo(cx - 70, sigY - 30);
        ctx.lineTo(cx + 70, sigY - 30);
        ctx.strokeStyle = '#c9a84c';
        ctx.lineWidth = 1;
        ctx.stroke();
        // Name
        ctx.fillStyle = '#333';
        ctx.font = 'bold 14px Georgia, serif';
        ctx.fillText(editor.trim(), cx, sigY - 8);
        ctx.fillStyle = '#777';
        ctx.font = '12px Georgia, serif';
        ctx.fillText('Editorial Team', cx, sigY + 10);
    });

    /* ── Date ── */
    const today = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
    ctx.textAlign = 'right';
    ctx.fillStyle = '#888';
    ctx.font = '13px Georgia, serif';
    ctx.fillText(`Date: ${today}`, W - 50, H - 36);

    /* ── Footer org name ── */
    ctx.textAlign = 'center';
    ctx.fillStyle = '#aaa';
    ctx.font = '12px Georgia, serif';
    ctx.fillText('Panchmeshali Literary Platform', W / 2, H - 36);

    /* ── Trigger download ── */
    const link = document.createElement('a');
    link.download = `Certificate_${opts.participantName.replace(/\s+/g, '_')}_${opts.position === 0 ? 'Participation' : `${ordinal(opts.position)}`}.png`;
    link.href = canvas.toDataURL('image/png', 1.0);
    link.click();
}
