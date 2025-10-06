export async function generateLikesForBatch(avgLikes, batch) {
    return batch.map(song => {
        const baseLikes = Math.floor(avgLikes);
        const fraction = avgLikes - baseLikes;
        const extraLike = Math.random() < fraction ? 1 : 0;
        return { ...song, likes: baseLikes + extraLike };
    });
}
