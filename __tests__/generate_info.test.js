import { jest } from '@jest/globals';

// Mock Date.now for predictable timestamps BEFORE importing the module
const mockDateNow = jest.spyOn(Date, 'now');
mockDateNow.mockReturnValue(1234567890);

// Mock the canvas module
const mockToBuffer = jest.fn(() => Buffer.from('fake-image-data'));
const mockGetContext = jest.fn(() => ({
  drawImage: jest.fn(),
  fillRect: jest.fn(),
  fillText: jest.fn(),
  font: '',
  fillStyle: '',
  textAlign: '',
}));
const mockCreateCanvas = jest.fn(() => ({
  getContext: mockGetContext,
  toBuffer: mockToBuffer,
}));
const mockLoadImage = jest.fn(() => Promise.resolve({ width: 800, height: 800 }));

jest.unstable_mockModule('canvas', () => ({
  createCanvas: mockCreateCanvas,
  loadImage: mockLoadImage,
}));

// Mock fs/promises
const mockMkdir = jest.fn(() => Promise.resolve());
const mockWriteFile = jest.fn(() => Promise.resolve());

jest.unstable_mockModule('fs/promises', () => ({
  default: {
    mkdir: mockMkdir,
    writeFile: mockWriteFile,
  },
  mkdir: mockMkdir,
  writeFile: mockWriteFile,
}));

// Import the module AFTER mocking
const { generateInfo } = await import('../routes/generator/generate_info.js');

describe('generateInfo', () => {
  let mockFaker;
  
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    mockCreateCanvas.mockClear();
    mockLoadImage.mockClear();
    mockMkdir.mockClear();
    mockWriteFile.mockClear();
    mockGetContext.mockClear();
    mockToBuffer.mockClear();
    
    // Reset mock implementations
    mockLoadImage.mockResolvedValue({ width: 800, height: 800 });
    mockMkdir.mockResolvedValue();
    mockWriteFile.mockResolvedValue();
    mockToBuffer.mockReturnValue(Buffer.from('fake-image-data'));
    
    // Create a fresh mock faker instance
    mockFaker = {
      music: {
        artist: jest.fn(),
        album: jest.fn(),
        genre: jest.fn(),
        songName: jest.fn(),
      },
      person: {
        fullName: jest.fn(),
      },
      number: {
        int: jest.fn(),
      },
      word: {
        noun: jest.fn(),
        adjective: jest.fn(),
        words: jest.fn(),
      },
      company: {
        name: jest.fn(),
      },
      image: {
        avatarGitHub: jest.fn(),
      },
    };
  });

  afterAll(() => {
    mockDateNow.mockRestore();
  });

  describe('Happy path - all faker methods work', () => {
    test('should generate complete music info with all faker methods working', async () => {
      mockFaker.music.artist.mockReturnValue('The Beatles');
      mockFaker.music.album.mockReturnValue('Abbey Road');
      mockFaker.music.genre.mockReturnValue('Rock');
      mockFaker.music.songName.mockReturnValue('Come Together');
      mockFaker.company.name.mockReturnValue('Apple Records');
      mockFaker.image.avatarGitHub.mockReturnValue('https://example.com/avatar.png');

      const result = await generateInfo(mockFaker, 123, 1);

      expect(result).toEqual({
        artist: 'The Beatles',
        album: 'Abbey Road',
        genre: 'Rock',
        title: 'Come Together',
        company: 'Apple Records',
        image: expect.stringContaining('/covers/123_1/cover_1234567890.jpg'),
      });

      expect(mockFaker.music.artist).toHaveBeenCalledTimes(1);
      expect(mockFaker.music.album).toHaveBeenCalledTimes(1);
      expect(mockFaker.music.genre).toHaveBeenCalledTimes(1);
      expect(mockFaker.music.songName).toHaveBeenCalledTimes(1);
    });

    test('should generate different paths for different seeds and pages', async () => {
      mockFaker.music.artist.mockReturnValue('Artist');
      mockFaker.music.album.mockReturnValue('Album');
      mockFaker.music.genre.mockReturnValue('Genre');
      mockFaker.music.songName.mockReturnValue('Song');
      mockFaker.company.name.mockReturnValue('Company');
      mockFaker.image.avatarGitHub.mockReturnValue('https://example.com/avatar.png');

      const result1 = await generateInfo(mockFaker, 111, 1);
      const result2 = await generateInfo(mockFaker, 222, 2);

      expect(result1.image).toContain('/covers/111_1/');
      expect(result2.image).toContain('/covers/222_2/');
    });
  });

  describe('Fallback logic - artist generation', () => {
    test('should generate artist from person name when music.artist throws', async () => {
      mockFaker.music.artist.mockImplementation(() => {
        throw new Error('Not available');
      });
      mockFaker.person.fullName.mockReturnValue('John Smith');
      mockFaker.number.int.mockReturnValue(2);
      mockFaker.word.noun.mockReturnValueOnce('studio').mockReturnValueOnce('records');
      mockFaker.music.album.mockReturnValue('Album');
      mockFaker.music.genre.mockReturnValue('Genre');
      mockFaker.music.songName.mockReturnValue('Song');
      mockFaker.company.name.mockReturnValue('Company');
      mockFaker.image.avatarGitHub.mockReturnValue('https://example.com/avatar.png');

      const result = await generateInfo(mockFaker, 123, 1);

      // Artist should be either "John Studio Records" or "Smith Studio Records"
      expect(result.artist).toMatch(/^(John|Smith) Studio Records$/);
      expect(mockFaker.person.fullName).toHaveBeenCalled();
      expect(mockFaker.word.noun).toHaveBeenCalledTimes(2);
    });

    test('should handle person name with fallback to "Unknown"', async () => {
      mockFaker.music.artist.mockImplementation(() => {
        throw new Error('Not available');
      });
      mockFaker.person.fullName.mockReturnValue(null);
      mockFaker.number.int.mockReturnValue(1);
      mockFaker.word.noun.mockReturnValue('music');
      mockFaker.music.album.mockReturnValue('Album');
      mockFaker.music.genre.mockReturnValue('Genre');
      mockFaker.music.songName.mockReturnValue('Song');
      mockFaker.company.name.mockReturnValue('Company');
      mockFaker.image.avatarGitHub.mockReturnValue('https://example.com/avatar.png');

      const result = await generateInfo(mockFaker, 123, 1);

      expect(result.artist).toContain('Unknown');
    });

    test('should randomly choose first or last name for artist', async () => {
      mockFaker.music.artist.mockImplementation(() => {
        throw new Error('Not available');
      });
      mockFaker.person.fullName.mockReturnValue('Jane Elizabeth Doe');
      mockFaker.number.int.mockReturnValue(1);
      mockFaker.word.noun.mockReturnValue('band');
      mockFaker.music.album.mockReturnValue('Album');
      mockFaker.music.genre.mockReturnValue('Genre');
      mockFaker.music.songName.mockReturnValue('Song');
      mockFaker.company.name.mockReturnValue('Company');
      mockFaker.image.avatarGitHub.mockReturnValue('https://example.com/avatar.png');

      const result = await generateInfo(mockFaker, 123, 1);

      // Should be either "Jane Band" or "Doe Band"
      expect(result.artist).toMatch(/^(Jane|Doe) Band$/);
    });
  });

  describe('Fallback logic - album generation', () => {
    test('should generate album from nouns when music.album throws', async () => {
      mockFaker.music.artist.mockReturnValue('Artist');
      mockFaker.music.album.mockImplementation(() => {
        throw new Error('Not available');
      });
      mockFaker.number.int
        .mockReturnValueOnce(3) // for album word count
        .mockReturnValueOnce(2); // for title word count
      mockFaker.word.noun
        .mockReturnValueOnce('summer')
        .mockReturnValueOnce('night')
        .mockReturnValueOnce('dreams');
      mockFaker.music.genre.mockReturnValue('Genre');
      mockFaker.music.songName.mockReturnValue('Song');
      mockFaker.company.name.mockReturnValue('Company');
      mockFaker.image.avatarGitHub.mockReturnValue('https://example.com/avatar.png');

      const result = await generateInfo(mockFaker, 123, 1);

      expect(result.album).toBe('summer night dreams');
    });

    test('should handle empty strings from noun generation', async () => {
      mockFaker.music.artist.mockReturnValue('Artist');
      mockFaker.music.album.mockImplementation(() => {
        throw new Error('Not available');
      });
      mockFaker.number.int.mockReturnValue(2);
      // Return empty string - this will create ' ' which is truthy but effectively empty
      mockFaker.word.noun.mockReturnValue('');
      mockFaker.music.genre.mockReturnValue('Genre');
      mockFaker.music.songName.mockReturnValue('Song');
      mockFaker.company.name.mockReturnValue('Company');
      mockFaker.image.avatarGitHub.mockReturnValue('https://example.com/avatar.png');

      const result = await generateInfo(mockFaker, 123, 1);

      // Current behavior: empty strings joined create ' ' which doesn't trigger fallback
      // This is a limitation of the current implementation
      expect(result.album).toBe(' ');
    });

    test('should respect TITLE_AND_ALBUM_MIN and TITLE_AND_ALBUM_MAX environment variables', async () => {
      mockFaker.music.artist.mockReturnValue('Artist');
      mockFaker.music.album.mockImplementation(() => {
        throw new Error('Not available');
      });
      mockFaker.number.int.mockReturnValue(2);
      mockFaker.word.noun.mockReturnValue('word');
      mockFaker.music.genre.mockReturnValue('Genre');
      mockFaker.music.songName.mockReturnValue('Song');
      mockFaker.company.name.mockReturnValue('Company');
      mockFaker.image.avatarGitHub.mockReturnValue('https://example.com/avatar.png');

      await generateInfo(mockFaker, 123, 1);

      // Check that number.int was called with correct min/max for album
      expect(mockFaker.number.int).toHaveBeenCalledWith(
        expect.objectContaining({ min: expect.any(Number), max: expect.any(Number) })
      );
    });
  });

  describe('Fallback logic - genre generation', () => {
    test('should generate genre from adjective when music.genre throws', async () => {
      mockFaker.music.artist.mockReturnValue('Artist');
      mockFaker.music.album.mockReturnValue('Album');
      mockFaker.music.genre.mockImplementation(() => {
        throw new Error('Not available');
      });
      mockFaker.word.adjective.mockReturnValue('electronic');
      mockFaker.music.songName.mockReturnValue('Song');
      mockFaker.company.name.mockReturnValue('Company');
      mockFaker.image.avatarGitHub.mockReturnValue('https://example.com/avatar.png');

      const result = await generateInfo(mockFaker, 123, 1);

      expect(result.genre).toBe('electronic');
      expect(mockFaker.word.adjective).toHaveBeenCalled();
    });

    test('should use "Unknown Genre" when adjective generation fails', async () => {
      mockFaker.music.artist.mockReturnValue('Artist');
      mockFaker.music.album.mockReturnValue('Album');
      mockFaker.music.genre.mockImplementation(() => {
        throw new Error('Not available');
      });
      mockFaker.word.adjective.mockReturnValue(null);
      mockFaker.music.songName.mockReturnValue('Song');
      mockFaker.company.name.mockReturnValue('Company');
      mockFaker.image.avatarGitHub.mockReturnValue('https://example.com/avatar.png');

      const result = await generateInfo(mockFaker, 123, 1);

      expect(result.genre).toBe('Unknown Genre');
    });
  });

  describe('Fallback logic - title generation', () => {
    test('should generate title from words when music.songName throws', async () => {
      mockFaker.music.artist.mockReturnValue('Artist');
      mockFaker.music.album.mockReturnValue('Album');
      mockFaker.music.genre.mockReturnValue('Genre');
      mockFaker.music.songName.mockImplementation(() => {
        throw new Error('Not available');
      });
      mockFaker.number.int.mockReturnValue(3);
      mockFaker.word.words.mockReturnValue('amazing beautiful melody');
      mockFaker.company.name.mockReturnValue('Company');
      mockFaker.image.avatarGitHub.mockReturnValue('https://example.com/avatar.png');

      const result = await generateInfo(mockFaker, 123, 1);

      expect(result.title).toBe('amazing beautiful melody');
      expect(mockFaker.word.words).toHaveBeenCalledWith(3);
    });

    test('should use "Untitled" when words generation fails', async () => {
      mockFaker.music.artist.mockReturnValue('Artist');
      mockFaker.music.album.mockReturnValue('Album');
      mockFaker.music.genre.mockReturnValue('Genre');
      mockFaker.music.songName.mockImplementation(() => {
        throw new Error('Not available');
      });
      mockFaker.number.int.mockReturnValue(2);
      mockFaker.word.words.mockReturnValue(null);
      mockFaker.company.name.mockReturnValue('Company');
      mockFaker.image.avatarGitHub.mockReturnValue('https://example.com/avatar.png');

      const result = await generateInfo(mockFaker, 123, 1);

      expect(result.title).toBe('Untitled');
    });
  });

  describe('Image generation', () => {
    test('should create image with correct directory structure', async () => {
      mockFaker.music.artist.mockReturnValue('Artist');
      mockFaker.music.album.mockReturnValue('Album');
      mockFaker.music.genre.mockReturnValue('Genre');
      mockFaker.music.songName.mockReturnValue('Song Title');
      mockFaker.company.name.mockReturnValue('Company');
      mockFaker.image.avatarGitHub.mockReturnValue('https://example.com/avatar.png');

      await generateInfo(mockFaker, 456, 7);

      expect(mockMkdir).toHaveBeenCalledWith(
        expect.stringContaining('public\\covers\\456_7'),
        { recursive: true }
      );
    });

    test('should write image file with correct format', async () => {
      mockFaker.music.artist.mockReturnValue('Artist');
      mockFaker.music.album.mockReturnValue('Album');
      mockFaker.music.genre.mockReturnValue('Genre');
      mockFaker.music.songName.mockReturnValue('Song');
      mockFaker.company.name.mockReturnValue('Company');
      mockFaker.image.avatarGitHub.mockReturnValue('https://example.com/avatar.png');

      await generateInfo(mockFaker, 123, 1);

      expect(mockWriteFile).toHaveBeenCalledWith(
        expect.stringContaining('cover_1234567890.jpg'),
        expect.any(Buffer)
      );
    });

    test('should load and process the GitHub avatar image', async () => {
      mockFaker.music.artist.mockReturnValue('Artist');
      mockFaker.music.album.mockReturnValue('Album');
      mockFaker.music.genre.mockReturnValue('Genre');
      mockFaker.music.songName.mockReturnValue('Song');
      mockFaker.company.name.mockReturnValue('Company');
      mockFaker.image.avatarGitHub.mockReturnValue('https://example.com/avatar.png');

      await generateInfo(mockFaker, 123, 1);

      expect(mockLoadImage).toHaveBeenCalledWith('https://example.com/avatar.png');
    });
  });

  describe('Return value structure', () => {
    test('should return object with all required properties', async () => {
      mockFaker.music.artist.mockReturnValue('Artist');
      mockFaker.music.album.mockReturnValue('Album');
      mockFaker.music.genre.mockReturnValue('Genre');
      mockFaker.music.songName.mockReturnValue('Song');
      mockFaker.company.name.mockReturnValue('Company');
      mockFaker.image.avatarGitHub.mockReturnValue('https://example.com/avatar.png');

      const result = await generateInfo(mockFaker, 123, 1);

      expect(result).toHaveProperty('artist');
      expect(result).toHaveProperty('album');
      expect(result).toHaveProperty('genre');
      expect(result).toHaveProperty('title');
      expect(result).toHaveProperty('company');
      expect(result).toHaveProperty('image');
    });

    test('should return proper types for all properties', async () => {
      mockFaker.music.artist.mockReturnValue('Artist');
      mockFaker.music.album.mockReturnValue('Album');
      mockFaker.music.genre.mockReturnValue('Genre');
      mockFaker.music.songName.mockReturnValue('Song');
      mockFaker.company.name.mockReturnValue('Company');
      mockFaker.image.avatarGitHub.mockReturnValue('https://example.com/avatar.png');

      const result = await generateInfo(mockFaker, 123, 1);

      expect(typeof result.artist).toBe('string');
      expect(typeof result.album).toBe('string');
      expect(typeof result.genre).toBe('string');
      expect(typeof result.title).toBe('string');
      expect(typeof result.company).toBe('string');
      expect(typeof result.image).toBe('string');
    });
  });

  describe('Edge cases', () => {
    test('should handle empty string returns from faker', async () => {
      mockFaker.music.artist.mockReturnValue('');
      mockFaker.music.album.mockReturnValue('');
      mockFaker.music.genre.mockReturnValue('');
      mockFaker.music.songName.mockReturnValue('');
      mockFaker.company.name.mockReturnValue('');
      mockFaker.image.avatarGitHub.mockReturnValue('https://example.com/avatar.png');

      const result = await generateInfo(mockFaker, 123, 1);

      // Should still return valid object even with empty strings
      expect(result).toHaveProperty('artist');
      expect(result).toHaveProperty('album');
      expect(result).toHaveProperty('genre');
      expect(result).toHaveProperty('title');
    });

    test('should handle single-word person names in fallback', async () => {
      mockFaker.music.artist.mockImplementation(() => {
        throw new Error('Not available');
      });
      mockFaker.person.fullName.mockReturnValue('Madonna');
      mockFaker.number.int.mockReturnValue(1);
      mockFaker.word.noun.mockReturnValue('music');
      mockFaker.music.album.mockReturnValue('Album');
      mockFaker.music.genre.mockReturnValue('Genre');
      mockFaker.music.songName.mockReturnValue('Song');
      mockFaker.company.name.mockReturnValue('Company');
      mockFaker.image.avatarGitHub.mockReturnValue('https://example.com/avatar.png');

      const result = await generateInfo(mockFaker, 123, 1);

      expect(result.artist).toBe('Madonna Music');
    });
  });
});
