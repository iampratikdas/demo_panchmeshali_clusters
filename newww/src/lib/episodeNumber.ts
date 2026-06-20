import type { EventEpisode } from './api';

export function parseEpisodeNumber(value: string): number | null {
    const trimmed = value.trim();
    if (!trimmed || !/^\d+$/.test(trimmed)) return null;
    const num = parseInt(trimmed, 10);
    return num >= 1 ? num : null;
}

export function getUsedEpisodeNumbers(episodes: EventEpisode[]): number[] {
    const nums = episodes
        .map(ep => parseEpisodeNumber(ep.episodeNumber ?? ''))
        .filter((n): n is number => n !== null);
    return [...new Set(nums)].sort((a, b) => a - b);
}

export function getSuggestedEpisodeNumber(episodes: EventEpisode[]): string {
    const used = new Set(getUsedEpisodeNumbers(episodes));
    let candidate = 1;
    while (used.has(candidate)) candidate++;
    return String(candidate);
}

export function validateEpisodeNumber(
    episodeNumber: string,
    episodes: EventEpisode[],
): string | null {
    const num = parseEpisodeNumber(episodeNumber);
    if (num === null) return 'Episode number must be a positive integer';
    if (getUsedEpisodeNumbers(episodes).includes(num)) {
        return `Episode number ${num} is already used for this event`;
    }
    return null;
}
