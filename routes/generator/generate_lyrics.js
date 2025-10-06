import dotenv from 'dotenv'
dotenv.config();

const MIN_LYRIC_LINES = parseInt(process.env.LYRIC_LINES_MIN);
const MAX_LYRIC_LINES = parseInt(process.env.LYRIC_LINES_MAX);

function generateLyricLine(fakerInstance) {
    const adjective = fakerInstance.word.adjective();
    const noun = fakerInstance.word.noun();
    const verb = fakerInstance.word.verb();
    const adverb = fakerInstance.word.adverb();
    return `${adjective} ${noun} ${verb} ${adverb}`;
}

export function generateLyrics(fakerInstance) {
    const lines = fakerInstance.number.int({ min: MIN_LYRIC_LINES, max: MAX_LYRIC_LINES });
    return Array.from({ length: lines }, () => generateLyricLine(fakerInstance)).join('\n');
}
