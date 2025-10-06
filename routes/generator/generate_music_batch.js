import { createFaker } from './create_faker.js';
import { generateLyrics } from './generate_lyrics.js';
import { generateInfo } from './generate_info.js';
import { generateMelody } from './generate_melody.js';
import { combineSeedPage } from './combine_seed_page.js';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';

dotenv.config();

const BATCH_SIZE = parseInt(process.env.BATCH);

export async function generateMusicBatch(seed, locale, size = BATCH_SIZE, pageNumber = 1) {
    const coversDir = path.join(process.cwd(), 'public', 'covers');
    try {
        await fs.rm(coversDir, { recursive: true, force: true });
        await fs.mkdir(coversDir, { recursive: true });
    } catch (err) {
        console.error(' Failed to clean /public/covers:', err);
    }

    const batch = [];
    for (let i = 0; i < size; i++) {
        const combinedSeed = combineSeedPage(seed, pageNumber, i, locale);
        const fakerInstance = createFaker(combinedSeed, locale);

        const info = await generateInfo(fakerInstance);
        const lyrics = generateLyrics(fakerInstance);
        const music = generateMelody(fakerInstance);

        batch.push({
            seed: combinedSeed,
            lyrics,
            info,
            music,
            likes: 0,
        });
    }

    return batch;
}
