export async function runWithConcurrency<T>(
    items: T[],
    concurrency: number,
    worker: (item: T, index: number) => Promise<void>
) {
    const workerCount = Math.min(Math.max(1, Math.floor(concurrency)), items.length);
    let cursor = 0;

    const runners = Array.from({ length: workerCount }, async () => {
        while (cursor < items.length) {
            const index = cursor;
            cursor += 1;
            await worker(items[index], index);
        }
    });

    await Promise.all(runners);
}
