import { Faker, en, de, es, fr } from '@faker-js/faker';

const localesMap = { en, de, es, fr };

export function createFaker(seed, locale) {
    const localeModule = localesMap[locale];
    const fakerInstance = new Faker({ locale: [localeModule] });
    fakerInstance.seed(seed);
    return fakerInstance;
}
