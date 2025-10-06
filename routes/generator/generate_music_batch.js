import { createFaker } from './create_faker.js';
import { generateLyrics } from './generate_lyrics.js';
import { generateInfo } from './generate_info.js';
import { generateMelody } from './generate_melody.js';
import { combineSeedPage } from './combine_seed_page.js';
import dotenv from 'dotenv';

dotenv.config();

const BATCH_SIZE = parseInt(process.env.BATCH);

export async function generateMusicBatch(seed, locale, size = BATCH_SIZE, page) {
    const batch = [];

    for (let i = 0; i < size; i++) {
        const combinedSeed = combineSeedPage(seed, page, i, locale);
        const fakerInstance = createFaker(combinedSeed, locale);
        const info = await generateInfo(fakerInstance, seed, page);
        const lyrics = generateLyrics(fakerInstance);
        const music = generateMelody(fakerInstance);

        batch.push({ combinedSeed, info, lyrics, music, likes: 0 });
    }

    return batch;
}
