import dotenv from 'dotenv';
dotenv.config();
import { createCanvas, loadImage } from 'canvas';
import fs from 'fs/promises';
import path from 'path';

const TITLE_AND_ALBUM_MAX = parseInt(process.env.TITLE_ALBUM_MAX) || 3;
const TITLE_AND_ALBUM_MIN = parseInt(process.env.TITLE_ALBUM_MIN) || 1;

export async function generateInfo(fakerInstance) {
    let artist;
    try {
        artist = fakerInstance.music.artist();
    } catch {
        const person = fakerInstance.person.fullName() || 'Unknown';
        const nameParts = person.split(' ');
        const chosenName = Math.random() < 0.5 ? nameParts[0] : nameParts[nameParts.length - 1];
        const wordCount = fakerInstance.number.int({ min: 1, max: 2 });
        const companyWords = Array.from({ length: wordCount }, () => fakerInstance.word.noun());
        const companyName = companyWords.map(w => w[0].toUpperCase() + w.slice(1)).join(' ');
        artist = `${chosenName} ${companyName}`;
    }

    const countAlbum = fakerInstance.number.int({ min: TITLE_AND_ALBUM_MIN, max: TITLE_AND_ALBUM_MAX });
    let album;
    try {
        album = fakerInstance.music.album();
    } catch {
        album =
            Array.from({ length: countAlbum }, () => fakerInstance.word.noun()).join(' ') ||
            'Unknown Album';
    }

    let genre;
    try {
        genre = fakerInstance.music.genre();
    } catch {
        genre = fakerInstance.word.adjective() || 'Unknown Genre';
    }

    const countTitle = fakerInstance.number.int({ min: TITLE_AND_ALBUM_MIN, max: TITLE_AND_ALBUM_MAX });
    let title;
    try {
        title = fakerInstance.music.songName();
    } catch {
        title = fakerInstance.word.words(countTitle) || 'Untitled';
    }

    const company = fakerInstance.company.name();
    const image = fakerInstance.image.avatarGitHub(); 

    const info = { artist, company, album, genre, title, image };

    const imagePath = await createImageWithTitle(info);

    return { artist, company, album, genre, title, image: imagePath };
}

async function createImageWithTitle(info) {
    const width = 800;
    const height = 800;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    const baseImage = await loadImage(info.image);
    ctx.drawImage(baseImage, 0, 0, width, height);
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(0, 0, width, height);

    const words = info.title.toUpperCase().split(' ');
    const minFont = 40;
    const maxFont = 160;
    const wordSizes = words.map(word => Math.max(minFont, maxFont - word.length * 5));
    const totalHeight = wordSizes.reduce((sum, size) => sum + size * 1.2, 0);
    let y = (height - totalHeight) / 2;

    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';

    for (let i = 0; i < words.length; i++) {
        const word = words[i];
        const size = wordSizes[i];
        ctx.font = `bold ${size}px Sans`;
        ctx.fillText(word, width / 2, y + size); 
        y += size * 1.2; 
    }

    const outputDir = path.join(process.cwd(), 'public', 'covers');
    await fs.mkdir(outputDir, { recursive: true });
    const fileName = `cover_${Date.now()}.jpg`;
    const filePath = path.join(outputDir, fileName);
    await fs.writeFile(filePath, canvas.toBuffer('image/jpeg', { quality: 0.9 }));

    return `/covers/${fileName}`;
}
