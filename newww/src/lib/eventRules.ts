import type { Event } from '../types/event';

/** When true (default), a writer may publish more than one piece on the same event. */
export function allowsMultipleContent(event?: Pick<Event, 'multiple_content'> | null): boolean {
    return event?.multiple_content !== false;
}

/** Head/series title is used only when episode-wise and multiple content is allowed. */
export function requiresHeadTitle(event?: Pick<Event, 'episode_wise' | 'multiple_content'> | null): boolean {
    return !!event?.episode_wise && allowsMultipleContent(event);
}

/** Episode-wise event locked to a single novel — story title only, no head title. */
export function isSingleNovelEpisodeMode(event?: Pick<Event, 'episode_wise' | 'multiple_content'> | null): boolean {
    return !!event?.episode_wise && event?.multiple_content === false;
}
