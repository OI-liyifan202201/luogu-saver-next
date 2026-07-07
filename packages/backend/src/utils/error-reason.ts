export const MAX_ERROR_REASON_LENGTH = 80;

export function normalizeErrorReason(input: unknown): string {
    const raw = input instanceof Error ? input.message : String(input ?? '');
    const reason = raw.replace(/\s+/g, ' ').trim() || 'Unknown error';
    if (reason.length <= MAX_ERROR_REASON_LENGTH) return reason;
    return `${reason.slice(0, MAX_ERROR_REASON_LENGTH - 3)}...`;
}
