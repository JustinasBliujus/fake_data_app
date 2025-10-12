# Mutacijų Testavimo Vadovas

## Kas yra Mutacijų Testavimas?

**Mutacijų testavimas** (Mutation Testing) yra būdas patikrinti, ar jūsų testai yra pakankamai geri. 

### Kaip tai veikia?

1. **Stryker automatiškai pakeičia kodą** (sukuria "mutantus"):
   - `+` → `-`
   - `<` → `<=`
   - `'Unknown'` → `''`
   - `true` → `false`

2. **Paleidžia testus** kiekvienai mutacijai

3. **Tikrina rezultatus**:
   - ✅ **Killed** (Nužudyta) - Testas aptiko klaidą. Puiku!
   - ❌ **Survived** (Išgyveno) - Testas nepastebėjo klaidos. Blogai!
   - ⚪ **No Coverage** - Šis kodas nebuvo testuotas

## Greitas Startas

### Paleisti Mutacijų Testą

```powershell
npm run test:mutation
```

### Peržiūrėti Rezultatus

Po testo pabaigos atsidarys HTML ataskaita arba galite ją rasti:
```
mutation-report.html
```

## Komandos

```powershell
# Paleisti mutacijų testavimą
npm run test:mutation

# Paleisti su detaliais logais
npx stryker run --logLevel debug

# Paleisti tik su specific mutacijomis
npx stryker run --mutate "routes/generator/generate_info.js"
```

## Konfigūracija

Konfigūracija yra faile: **`stryker.config.json`**

### Pagrindiniai Nustatymai

```json
{
  "mutate": ["routes/generator/generate_info.js"],  // Kokie failai testuojami
  "testRunner": "jest",                              // Kokia testavimo platforma
  "coverageAnalysis": "perTest",                     // Aprėpties analizė
  "concurrency": 2,                                  // Kiek procesų vienu metu
  "timeoutMS": 60000                                 // Maksimalus testas ilgis
}
```

## Rezultatų Supratimas

### Mutation Score

**Mutation Score** = (Nužudyti mutantai / Visi mutantai) × 100%

```
54% Mutation Score = 56 killed / 103 total
```

### Statusai

| Statusas | Emoji | Reikšmė | Gerai/Blogai |
|----------|-------|---------|--------------|
| **Killed** | ✅ | Testas aptiko mutaciją | ✅ Gerai! |
| **Survived** | ❌ | Testas nepastebėjo mutacijos | ❌ Blogai |
| **No Coverage** | ⚪ | Kodas nebuvo testuotas | ❌ Blogai |
| **Timeout** | ⏱️ | Testas truko per ilgai | 🟡 Galbūt problema |
| **Runtime Error** | 💥 | Testas sudūžo | ❌ Blogai |

### Tikslo Lygiai

| Mutation Score | Įvertinimas | Aprašymas |
|----------------|-------------|-----------|
| **80-100%** | 🟢 Puiku | Labai geri testai |
| **60-79%** | 🟡 Gerai | Geri testai, bet galima gerinti |
| **40-59%** | 🟠 Vidutiniškai | Pagrindinis funkcionalumas testuojamas |
| **0-39%** | 🔴 Blogai | Testai pernelyg silpni |

## Mutacijų Tipai

### 1. Arithmetic Operator (Aritmetiniai Operatoriai)
```javascript
// Originalas
maxFont - word.length * 5

// Mutacijos
maxFont + word.length * 5  // - → +
maxFont - word.length / 5  // * → /
```

### 2. Conditional Expression (Sąlygos)
```javascript
// Originalas
Math.random() < 0.5 ? a : b

// Mutacijos
true ? a : b               // condition → true
false ? a : b              // condition → false
Math.random() <= 0.5 ? a : b  // < → <=
```

### 3. String Literal (Eilutės)
```javascript
// Originalas
ctx.getContext('2d')

// Mutacija
ctx.getContext('')         // '2d' → ''
```

### 4. Block Statement (Blokai)
```javascript
// Originalas
if (condition) {
    doSomething();
}

// Mutacija
if (condition) {
    // tuščia - pašalinta logika
}
```

## Mūsų Projekto Rezultatai

### generate_info.js

```
Mutation Score: 54%
Testų: 19
Mutantų: 103
Nužudyta: 56
Išgyveno: 37
No Coverage: 7
```

### Stipriosios Pusės ✅

- ✅ Puikus biznes logikos testavimas
- ✅ Visi error handling scenarijai padengti
- ✅ Fallback logika gerai testuojama
- ✅ Return values validuojami

### Silpnosios Pusės ❌

- ❌ Canvas rendering logika netestuojama
- ❌ Matematiniai skaičiavimai nevaliduojami  
- ❌ Atsitiktinių reikšmių logika nepatikrinama
- ❌ String formavimas nevaliduojamas

## Kaip Pagerinti Testus?

### 1. Testuoti Canvas Savybes
```javascript
test('should set correct canvas fillStyle', () => {
    const ctx = mockGetContext();
    expect(ctx.fillStyle).toBe('rgba(0,0,0,0.5)');
});
```

### 2. Validuoti Skaičiavimus
```javascript
test('should calculate correct font sizes', () => {
    const result = await generateInfo(mockFaker, 123, 1);
    // Tikrinti, kad font size'ai yra teisingi
});
```

### 3. Testuoti Atsitiktinumą
```javascript
test('should produce varied results', () => {
    const results = new Set();
    for (let i = 0; i < 100; i++) {
        const result = generateInfo(mockFaker, i, 1);
        results.add(result.artist);
    }
    expect(results.size).toBeGreaterThan(1);
});
```

## Dažnai Užduodami Klausimai

### K: Kodėl Mutation Score nėra 100%?

**A:** Tai normalu! Dažnai:
- Canvas/UI logika sunku testuoti su unit testais
- Kai kurios mutacijos neturi praktinės reikšmės
- 80%+ jau laikoma puikiu rezultatu

### K: Kiek laiko trunka mutation testing?

**A:** Priklausomai nuo:
- Kodo kiekio
- Testų kiekio
- Kompiuterio galingumo

Mūsų atveju: ~2-5 minutės 103 mutantams.

### K: Ar reikia testuoti viską?

**A:** Ne! Fokusuokitės į:
- Kritinę biznes logiką
- Sudėtingas funkcijas
- Klaidas linkusius kodo sklypus

### K: Kaip interpretuoti "Survived" mutantus?

**A:** Galimos priežastys:
1. Testas nepakankamai tikslus
2. Mutacija neturi realios įtakos
3. Kodas turi dubliuotą logiką
4. Mock'ai slepia tikrą elgesį

## Papildoma Informacija

### Dokumentacija

- [Stryker Mutator Docs](https://stryker-mutator.io/)
- [Mutation Testing įvadas](https://stryker-mutator.io/docs/General/what-is-mutation-testing/)

### Failai Projekte

- `stryker.config.json` - Konfigūracija
- `mutation-report.html` - HTML ataskaita
- `mutation-report.json` - JSON duomenys
- `MUTATION_TESTING_ANALYSIS.md` - Detalus įvertinimas

### Performance Patarimai

```json
{
  "concurrency": 4,           // Didinti, jei turite daug CPU core'ų
  "timeoutMS": 30000,         // Mažinti, jei testai greiti
  "coverageAnalysis": "off"   // Greitesnis, bet mažiau tikslus
}
```

## Santrauka

Mutacijų testavimas:
- 🎯 Tikrina testų kokybę, ne kodo kokybę
- 📊 Rodo, kur testai yra silpni
- ✅ Padeda rasti trūkstamus test cases
- 🚀 Pagerina pasitikėjimą kodu

**Tikslas:** Ne 100% mutation score, o **pasitikėjimas**, kad testai apsaugo nuo regresijų!
