import { Link } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
    BookOpen,
    PenLine,
    Trophy,
    Sparkles,
    ArrowRight,
    Compass,
} from 'lucide-react';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { isAuthenticated } from '../lib/auth';

interface LandingPageProps {
    variant?: 'default' | 'not-found';
}

const features = [
    { icon: PenLine, label: 'Write', desc: 'Craft stories & poems in your workspace' },
    { icon: BookOpen, label: 'Submit', desc: 'Join events and share your voice' },
    { icon: Trophy, label: 'Compete', desc: 'Rank among the best creators' },
];

const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
};

const floatVariants = {
    initial: { y: 0 },
    animate: {
        y: [-6, 6, -6],
        transition: { duration: 5, repeat: Infinity, ease: 'easeInOut' as const },
    },
};

const stagger = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.12, delayChildren: 0.08 },
    },
};

export default function LandingPage({ variant = 'default' }: LandingPageProps) {
    const { t } = useTranslation();
    const authed = isAuthenticated();
    const isNotFound = variant === 'not-found';

    return (
        <div className="min-h-[100dvh] bg-[#0b1220] text-white overflow-x-hidden font-serif relative">
            <div
                className="absolute inset-0 pointer-events-none opacity-30"
                aria-hidden
                style={{
                    backgroundImage:
                        'radial-gradient(circle at 20% 20%, rgba(99,102,241,0.35), transparent 40%), radial-gradient(circle at 80% 10%, rgba(236,72,153,0.2), transparent 35%), radial-gradient(circle at 50% 80%, rgba(59,130,246,0.25), transparent 45%)',
                }}
            />
            <div
                className="absolute inset-0 pointer-events-none opacity-15"
                aria-hidden
                style={{
                    backgroundImage: 'radial-gradient(circle at center, #ffffff 1px, transparent 1px)',
                    backgroundSize: '32px 32px',
                }}
            />

            <div className="relative z-10 flex flex-col min-h-[100dvh] px-4 py-6 sm:px-6 max-w-lg mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <motion.div
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-2"
                    >
                        <div className="h-9 w-9 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center">
                            <BookOpen className="h-4 w-4 text-indigo-200" />
                        </div>
                        <span className="text-sm font-sans font-medium text-slate-300 tracking-wide">
                            {t('login.brandName')}
                        </span>
                    </motion.div>
                    <LanguageSwitcher />
                </div>

                <motion.div
                    variants={stagger}
                    initial="hidden"
                    animate="visible"
                    className="flex-1 flex flex-col justify-center pb-8"
                >
                    {isNotFound && (
                        <motion.div variants={fadeUp} className="mb-5">
                            <span className="inline-flex items-center gap-1.5 text-[11px] font-sans uppercase tracking-widest text-amber-300/90 bg-amber-400/10 border border-amber-400/20 px-3 py-1.5 rounded-full">
                                <Compass className="h-3 w-3" />
                                Page not found
                            </span>
                        </motion.div>
                    )}

                    <motion.div variants={fadeUp} className="relative mb-6">
                        <motion.div
                            variants={floatVariants}
                            initial="initial"
                            animate="animate"
                            className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/30 mb-5"
                        >
                            <Sparkles className="h-8 w-8 text-white" />
                        </motion.div>
                        <h1 className="text-3xl sm:text-4xl font-medium leading-tight text-slate-50 mb-3">
                            {isNotFound ? 'This chapter isn\'t written yet' : t('login.subtitle')}
                        </h1>
                        <p className="text-slate-400 text-sm sm:text-base leading-relaxed font-sans max-w-sm">
                            {isNotFound
                                ? 'The page you\'re looking for doesn\'t exist or has moved. Head back to continue your journey.'
                                : 'Your creative library portal — write, submit to events, and rise on the leaderboard.'}
                        </p>
                    </motion.div>

                    <motion.div variants={fadeUp} id="features" className="grid gap-3 mb-8">
                        {features.map(({ icon: Icon, label, desc }, i) => (
                            <motion.div
                                key={label}
                                initial={{ opacity: 0, x: -16 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.35 + i * 0.1 }}
                                className="flex items-center gap-3 rounded-2xl bg-white/[0.06] border border-white/10 px-4 py-3.5 backdrop-blur-sm"
                            >
                                <div className="h-10 w-10 shrink-0 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                                    <Icon className="h-5 w-5 text-indigo-300" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-slate-100 font-sans">{label}</p>
                                    <p className="text-xs text-slate-400 font-sans leading-snug">{desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>

                    <motion.div variants={fadeUp} className="flex flex-col gap-3 sm:flex-row">
                        {authed ? (
                            <Link
                                to="/"
                                className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white text-slate-900 font-sans font-medium text-sm hover:bg-slate-100 transition-colors shadow-lg shadow-black/20"
                            >
                                Go to Dashboard
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        ) : (
                            <Link
                                to="/auth/login"
                                className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white text-slate-900 font-sans font-medium text-sm hover:bg-slate-100 transition-colors shadow-lg shadow-black/20"
                            >
                                {t('login.unlockBtn')}
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        )}
                        {!authed && (
                            <a
                                href="#features"
                                className="inline-flex items-center justify-center w-full sm:w-auto px-6 py-3.5 rounded-xl border border-white/15 text-slate-300 font-sans text-sm hover:bg-white/5 transition-colors"
                            >
                                Explore
                            </a>
                        )}
                    </motion.div>
                </motion.div>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="text-center text-[10px] uppercase tracking-[0.2em] text-slate-500 font-sans pb-2"
                >
                    {t('login.endlessStories')}
                </motion.p>
            </div>
        </div>
    );
}
