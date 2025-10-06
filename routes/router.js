import { Router } from 'express';
import dotenv from 'dotenv';
import { generateLikesForBatch } from './generator/generate_likes_for_batch.js';
import { generateMusicBatch } from './generator/generate_music_batch.js';
import crypto from 'crypto';

dotenv.config();
const router = Router();

const BATCH_SIZE = parseInt(process.env.BATCH);
const MAX_PAGES = parseInt(process.env.PAGES);
const DEFAULT_LOCALE = process.env.LOCALE;

function initializeSession(req) {
    if (!req.session.settings) {
        req.session.settings = {
            locale: DEFAULT_LOCALE,
            likes: 0,
            seed: '0',
            page: 1
        };
    }

    if (!req.session.cachedBatch) req.session.cachedBatch = null;
    if (!req.session.cachedBatchWithLikes) req.session.cachedBatchWithLikes = null;
}

router.get('/', async (req, res) => {
    initializeSession(req);
    const settings = req.session.settings;

    if (!req.session.cachedBatch) {
        req.session.cachedBatch = await generateMusicBatch(settings.seed, settings.locale, BATCH_SIZE, settings.page);
        req.session.cachedBatchWithLikes = await generateLikesForBatch(settings.likes, req.session.cachedBatch);
    }
    res.render('main', {
        title: 'Main',
        locale: settings.locale,
        likes: settings.likes,
        seed: settings.seed,
        batch: req.session.cachedBatchWithLikes,
        page: settings.page,
        batchSize: BATCH_SIZE,
        max_pages: MAX_PAGES
    });
});

router.post('/', async (req, res) => {
    initializeSession(req);
    let { locale, likes, seed: newSeed, page } = req.body;
    const settings = req.session.settings;

    const seedChanged = newSeed != null && newSeed !== settings.seed;
    const localeChanged = locale != null && locale !== settings.locale;
    const likesChanged = likes != null && likes !== settings.likes;
    const pageChanged = page != null && page !== settings.page;

    if (seedChanged || localeChanged || likesChanged) page = 1;

    req.session.settings = {
        locale: locale || settings.locale,
        likes: likes ?? settings.likes,
        seed: newSeed ?? settings.seed,
        page: page ?? settings.page
    };

    const updatedSettings = req.session.settings;

    if (seedChanged || localeChanged || pageChanged) {
        const newBatch = await generateMusicBatch(
            updatedSettings.seed,
            updatedSettings.locale,
            BATCH_SIZE,
            updatedSettings.page
        );

        if (!likesChanged) {
            req.session.cachedBatchWithLikes = newBatch.map((song, index) => ({
                ...song,
                likes: req.session.cachedBatchWithLikes[index]?.likes ?? 0
            }));
        } else {
            req.session.cachedBatchWithLikes = await generateLikesForBatch(
                updatedSettings.likes,
                newBatch
            );
        }

        req.session.cachedBatch = newBatch;
    }

    if (likesChanged) {
        req.session.cachedBatchWithLikes = await generateLikesForBatch(
            updatedSettings.likes,
            req.session.cachedBatch
        );
    }

    res.render('main', {
        title: 'Main',
        locale: updatedSettings.locale,
        likes: updatedSettings.likes,
        seed: updatedSettings.seed,
        batch: req.session.cachedBatchWithLikes,
        page: updatedSettings.page,
        batchSize: BATCH_SIZE,
        max_pages: MAX_PAGES
    });
});


router.post('/loadAccordionBatch', async (req, res) => {
    try {
        const { seed, likes, locale, page } = req.body;
        const newBatch = await generateMusicBatch(seed, locale, BATCH_SIZE, page);
        const batchWithLikes = await generateLikesForBatch(likes, newBatch);

        res.render('accordion-item', { batch: batchWithLikes, page, batchSize: BATCH_SIZE, max_pages: MAX_PAGES }, (err, html) => {
            if (err) {
                console.error('EJS render error:', err);
                return res.status(500).send(err.message);
            }
            res.send(html);
        });
    } catch (err) {
        console.error('Server error:', err);
        res.status(500).send(err.message);
    }
});

router.get('/seed', (req, res) => {
    const buf = crypto.randomBytes(8);
    const seed = buf.readBigUInt64BE(0);
    res.json({ seed: seed.toString() });
});

export default router;
