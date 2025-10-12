# Unit ir Mutacijų Testavimas - generate_info.js

## 📋 Turinys

1. [Greitasis Startas](#greitasis-startas)
2. [Unit Testai](#unit-testai)
3. [Mutacijų Testavimas](#mutacijų-testavimas)
4. [Rezultatai](#rezultatai)
5. [Dokumentacija](#dokumentacija)

---

## 🚀 Greitasis Startas

### Įdiegti Dependencies
```powershell
npm install
```

### Paleisti Testus
```powershell
# Unit testai
npm test

# Su coverage
npm run test:coverage

# Tik generate_info.js coverage
npm run test:coverage:generate-info

# Mutacijų testavimas
npm run test:mutation
```

---

## ✅ Unit Testai

### Statistika
- **Testų:** 19
- **Laikas:** ~0.35s
- **Rezultatas:** 19/19 ✅ PASS

### Coverage
```
Statement Coverage:  95.89% ✅
Branch Coverage:     87.5%  ✅
Function Coverage:   90.9%  ✅
Line Coverage:       96.87% ✅
```

### Testuojama
✅ Visa biznes logika  
✅ Visi error handling scenarijai  
✅ Visos fallback logikos  
✅ Return value struktūra  
✅ Edge cases  

### Kas Testuojama?

#### 1. Happy Path (2 testai)
- Viskas veikia be klaidų
- Skirtingi seeds/pages generuoja skirtingus path'us

#### 2. Fallback Logika (12 testų)
- **Artist:** faker.music.artist() fails → naudoja person + company
- **Album:** faker.music.album() fails → naudoja random words
- **Genre:** faker.music.genre() fails → naudoja adjective
- **Title:** faker.music.songName() fails → naudoja random words

#### 3. Image Generation (3 testai)
- Directory struktūra (`public/covers/{seed}_{page}/`)
- File writing (JPEG formatas)
- Image loading iš URL

#### 4. Return Value (2 testai)
- Visi property'ai egzistuoja
- Teisingi data types

#### 5. Edge Cases (2 testai)
- Tušti stringai iš faker
- Vieno žodžio vardai

---

## 🧬 Mutacijų Testavimas

### Statistika
```
Mutation Score:  54% 🟡
Mutantų:         103
Killed:          56  ✅
Survived:        37  ❌
No Coverage:     7   ⚪
Timeout:         1   ⏱️
Runtime Error:   2   💥
```

### Trys Pagrindiniai Mutacijų Tipai

#### 1️⃣ Arithmetic Operator (30% killed)
```javascript
// Pakeičia +, -, *, /
maxFont - word.length * 5
→ maxFont + word.length * 5  // ❌ SURVIVED
```
**Problema:** Canvas operacijos mock'intos

#### 2️⃣ Conditional Expression (40% killed)
```javascript
// Pakeičia true/false, <, >, <=, >=
Math.random() < 0.5 ? a : b
→ true ? a : b  // ❌ SURVIVED
```
**Problema:** Testas priima abi reikšmes

#### 3️⃣ String Literal (50% killed)
```javascript
// Pakeičia string reikšmes
ctx.fillStyle = 'rgba(0,0,0,0.5)'
→ ctx.fillStyle = ''  // ❌ SURVIVED
```
**Problema:** Canvas properties netikrinamos

---

## 📊 Rezultatai

### Palyginimas

| Metrika | Unit Tests | Mutation Tests |
|---------|-----------|----------------|
| **Coverage** | 96.87% ✅ | - |
| **Score** | - | 54% 🟡 |
| **Biznes Logika** | A+ | A+ |
| **Implementation** | - | D |
| **Bendras Įvertinimas** | A | B- |

### Stiprybės ✅
- Puikus code coverage (97%)
- Visi kritiniai scenarijai testuojami
- Error handling 100%
- Greiti testai (<1s)

### Silpnybės ❌
- Canvas operacijos netestuojamos
- Matematiniai skaičiavimai nevaliduojami
- Atsitiktinumo logika nepatikrinama
- Per daug mock'ų

---

## 📚 Dokumentacija

### Pagrindiniai Dokumentai

1. **[TEST_SUMMARY.md](./TEST_SUMMARY.md)**  
   Bendras unit testų apžvalga

2. **[__tests__/README.md](./__tests__/README.md)**  
   Kaip naudoti testus

3. **[MUTATION_SUMMARY.md](./MUTATION_SUMMARY.md)**  
   Vizuali mutacijų ataskaita

4. **[MUTATION_TESTING_ANALYSIS.md](./MUTATION_TESTING_ANALYSIS.md)**  
   Detalus 3 mutacijų tipų įvertinimas

5. **[MUTATION_TESTING_GUIDE_LT.md](./MUTATION_TESTING_GUIDE_LT.md)**  
   Vadovas lietuviškai

### HTML Ataskaitos

Po testų paleidimo:
- `coverage/lcov-report/index.html` - Code coverage
- `mutation-report.html` - Mutation testing

---

## 🎯 Pagrindinės Išvados

### Unit Testing: A (97/100)
✅ **Puikūs testai praktiniam naudojimui**
- Visas funkcionalumas veikia
- Klaidos sugaunamos
- Refactoring saugus

### Mutation Testing: B- (54/100)
🟡 **Geras pagrindas, bet galima gerinti**
- Biznes logika puikiai apsaugota
- Implementation details silpnai testuojami
- Reikia daugiau integration testų

### Rekomendacijos

1. **Pridėti Canvas property tests** (+10% mutation score)
2. **Validuoti matematinius skaičiavimus** (+8% mutation score)
3. **Testuoti randomness** (+5% mutation score)
4. **Integration testai su realiu canvas** (+12% mutation score)

**Tikslas:** 70-80% mutation score

---

## 🛠️ Technologijos

- **Testing Framework:** Jest 29.7.0
- **Mutation Testing:** Stryker Mutator 9.2.0
- **Node.js:** ES Modules
- **Mocking:** Jest built-in mocks

---

## 📞 Komandos

```powershell
# Testavimas
npm test                              # Paleisti testus
npm run test:watch                    # Watch mode
npm run test:coverage                 # Coverage visam projektui
npm run test:coverage:generate-info   # Coverage tik generate_info.js
npm run test:mutation                 # Mutation testing

# Development
npm start                             # Paleisti aplikaciją
```

---

**Autorius:** Justas Bliujus  
**Data:** 2025-10-12  
**Kursas:** PSK - Programų Sistemų Kūrimas  
**Užduotis:** Laboratorinis darbas #3 - Unit ir Mutacijų Testavimas
