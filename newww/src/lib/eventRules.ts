import type { Event } from '../types/event';

/** When true (default), a writer may publish more than one piece on the same event. */
export function allowsMultipleContent(event?: Pick<Event, 'multiple_content'> | null): boolean {
    return event?.multiple_content !== false;
}

/** Head title on episode-wise events — required for a new series; hidden when continuing single-novel episodes. */
export function requiresHeadTitle(
    event?: Pick<Event, 'episode_wise' | 'multiple_content'> | null,
    newSubmission?: boolean,
    hasExistingEpisodes?: boolean
): boolean {
    if (!event?.episode_wise) return false;
    if (!newSubmission) return false;
    if (hasExistingEpisodes && isSingleNovelEpisodeMode(event)) return false;
    return true;
}

/** Episode-wise event locked to a single novel — story title only, no head title. */
export function isSingleNovelEpisodeMode(event?: Pick<Event, 'episode_wise' | 'multiple_content'> | null): boolean {
    return !!event?.episode_wise && event?.multiple_content === false;
}

/** Category is chosen on new submissions, or when multiple content is allowed on the event. */
export function requiresCategorySelection(
    event?: Pick<Event, 'episode_wise' | 'multiple_content'> | null,
    newSubmission?: boolean
): boolean {
    if (!event?.episode_wise) return true;
    return !!newSubmission || allowsMultipleContent(event);
}
