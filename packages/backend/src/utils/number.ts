export function clampInt(value: unknown, fallback: number, min: number, max: number): number {
    const parsed = Number(value);
    const finiteValue = Number.isFinite(parsed) ? parsed : fallback;
    return Math.min(max, Math.max(min, Math.floor(finiteValue)));
}
