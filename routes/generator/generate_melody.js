import { formatMelodyDuration } from './format_melody_duration.js';
import dotenv from 'dotenv'
dotenv.config();

const MIN_NOTE_COUNT = parseInt(process.env.NOTE_COUNT_MIN);
const MAX_NOTE_COUNT = parseInt(process.env.NOTE_COUNT_MAX);
const MIN_NOTE_DURATION = parseFloat(process.env.NOTE_DURATION_MIN);
const MAX_NOTE_DURATION = parseFloat(process.env.NOTE_DURATION_MAX);
const MIN_OCTAVE = parseInt(process.env.OCTAVE_MIN);
const MAX_OCTAVE = parseInt(process.env.OCTAVE_MAX);
const DURATION_EQUALIZER = parseFloat(process.env.DUR_EQUALIZER);

export function generateMelody(fakerInstance) {
    let length = fakerInstance.number.int({ min: MIN_NOTE_COUNT, max: MAX_NOTE_COUNT });
    const noteDuration = fakerInstance.number.float({ min: MIN_NOTE_DURATION, max: MAX_NOTE_DURATION });
    length = Math.ceil(length * (1 + (1 - noteDuration * DURATION_EQUALIZER)));
    const octave = fakerInstance.number.int({ min: MIN_OCTAVE, max: MAX_OCTAVE });

    const melody = Array.from({ length }, () => {
        const noteInOctave = fakerInstance.number.int({ min: 0, max: 11 });
        return noteInOctave + octave * 12;
    });

    const songDuration = formatMelodyDuration(melody, noteDuration);
    return { melody, noteDuration, songDuration };
}
