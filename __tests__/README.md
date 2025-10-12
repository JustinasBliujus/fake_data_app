# Testing Guide for generate_info.js

This document explains the test suite created for `generate_info.js` and how to use it.

## Installation

First, install the testing dependencies:

```powershell
npm install
```

This will install:
- `jest` - Testing framework
- `@jest/globals` - Jest globals for ES modules

## Running Tests

### Run all tests
```powershell
npm test
```

### Run tests in watch mode (automatically re-run on file changes)
```powershell
npm run test:watch
```

### Run tests with coverage report
```powershell
npm run test:coverage
```

## Test Coverage

The test suite for `generate_info.js` includes:

### 1. **Happy Path Tests**
- Verifies that the function works correctly when all faker methods succeed
- Tests different seeds and pages generate different image paths

### 2. **Fallback Logic Tests**

#### Artist Generation
- Tests fallback when `faker.music.artist()` throws an error
- Verifies person name splitting and company word generation
- Tests handling of null/undefined person names
- Tests single-word and multi-word name handling

#### Album Generation
- Tests fallback when `faker.music.album()` throws an error
- Verifies word concatenation for album names
- Tests "Unknown Album" fallback

#### Genre Generation
- Tests fallback when `faker.music.genre()` throws an error
- Verifies adjective-based genre generation
- Tests "Unknown Genre" fallback

#### Title Generation
- Tests fallback when `faker.music.songName()` throws an error
- Verifies word count generation
- Tests "Untitled" fallback

### 3. **Image Generation Tests**
- Verifies correct directory creation (`public/covers/{seed}_{page}/`)
- Tests file writing with correct format (JPEG)
- Validates canvas operations
- Tests image loading from GitHub avatar URL

### 4. **Return Value Tests**
- Validates all required properties are present
- Verifies correct data types for all properties

### 5. **Edge Cases**
- Tests empty string returns from faker
- Tests single-word person names
- Tests various error conditions

## Test Structure

```javascript
describe('generateInfo', () => {
  // Setup mocks before each test
  beforeEach(() => { ... });
  
  // Test categories
  describe('Happy path', () => { ... });
  describe('Fallback logic - artist', () => { ... });
  describe('Fallback logic - album', () => { ... });
  // ... more test categories
});
```

## Mocking Strategy

The tests use Jest's mocking capabilities to:

1. **Mock external dependencies:**
   - `canvas` module (createCanvas, loadImage)
   - `fs/promises` (mkdir, writeFile)
   - `Date.now()` for predictable timestamps

2. **Mock faker instance:**
   - All faker methods are mocked with Jest functions
   - Allows testing both success and failure scenarios
   - Enables verification of method calls

## Example Test

```javascript
test('should generate complete music info', async () => {
  // Arrange: Setup mock returns
  mockFaker.music.artist.mockReturnValue('The Beatles');
  mockFaker.music.album.mockReturnValue('Abbey Road');
  
  // Act: Call the function
  const result = await generateInfo(mockFaker, 123, 1);
  
  // Assert: Verify results
  expect(result.artist).toBe('The Beatles');
  expect(result.album).toBe('Abbey Road');
});
```

## Coverage Goals

The test suite aims for:
- **Line Coverage:** >90%
- **Branch Coverage:** >85%
- **Function Coverage:** 100%

## Continuous Testing

For development, use watch mode:

```powershell
npm run test:watch
```

This will:
- Run tests automatically when files change
- Show only relevant test results
- Provide instant feedback during development

## Troubleshooting

### Tests fail with ES module errors
- Ensure `"type": "module"` is in package.json
- Check that Jest config uses the correct transform settings

### Canvas-related errors
- The canvas module is fully mocked, so actual canvas operations don't run
- If you see canvas errors, check the mock setup in the test file

### File system errors
- All file operations are mocked
- No actual files are created during tests
- Check that fs/promises mock is properly configured

## Contributing

When adding new features to `generate_info.js`:

1. Add corresponding tests
2. Run the test suite to ensure no regressions
3. Check coverage to ensure new code is tested
4. Update this README if needed
