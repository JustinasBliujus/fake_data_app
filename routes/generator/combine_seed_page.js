import crypto from 'crypto';
import dotenv from 'dotenv'
dotenv.config();

const SEED_MULTIPLIER = parseInt(process.env.MULTIPLIER_SEED);

export function combineSeedPage(seed, page, shift, locale) {
    const combined = `${seed * SEED_MULTIPLIER + page}`;
    const hashedShift = crypto.createHash('sha256').update(`${shift}`).digest('hex');
    const hashedCombined = crypto.createHash('sha256').update(combined).digest('hex');
    const hashedLocale = crypto.createHash('sha256').update(locale).digest('hex');
    const combinedHashes = hashedShift + hashedCombined + hashedLocale;
    return crypto.createHash('sha256').update(combinedHashes).digest('hex');
}
