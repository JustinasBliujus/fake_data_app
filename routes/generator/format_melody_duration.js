export function formatMelodyDuration(melody, noteDuration) {
    const totalSeconds = melody.length * noteDuration;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
