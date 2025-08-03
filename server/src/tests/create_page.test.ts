
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { pagesTable } from '../db/schema';
import { type CreatePageInput } from '../schema';
import { createPage } from '../handlers/create_page';
import { eq } from 'drizzle-orm';

// Test input with all required fields
const testInput: CreatePageInput = {
  title: 'Test Page',
  content: '# Hello World\n\nThis is a test page with *markdown* content.',
  hero_image_url: 'https://example.com/hero.jpg',
  theme: 'dark'
};

describe('createPage', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a page with all fields', async () => {
    const result = await createPage(testInput);

    // Validate response structure
    expect(result.id).toBeDefined();
    expect(typeof result.id).toBe('number');
    expect(result.public_url).toMatch(/^http:\/\/localhost:3000\/[a-zA-Z0-9_-]{12}$/);
    expect(result.edit_url).toMatch(/^http:\/\/localhost:3000\/edit\/[a-zA-Z0-9_-]{32}$/);
    expect(result.public_slug).toMatch(/^[a-zA-Z0-9_-]{12}$/);
    expect(result.edit_secret).toMatch(/^[a-zA-Z0-9_-]{32}$/);
  });

  it('should save page to database with correct data', async () => {
    const result = await createPage(testInput);

    // Query the database to verify the page was saved
    const pages = await db.select()
      .from(pagesTable)
      .where(eq(pagesTable.id, result.id))
      .execute();

    expect(pages).toHaveLength(1);
    const savedPage = pages[0];
    
    expect(savedPage.title).toBe('Test Page');
    expect(savedPage.content).toBe('# Hello World\n\nThis is a test page with *markdown* content.');
    expect(savedPage.hero_image_url).toBe('https://example.com/hero.jpg');
    expect(savedPage.theme).toBe('dark');
    expect(savedPage.public_slug).toBe(result.public_slug);
    expect(savedPage.edit_secret).toBe(result.edit_secret);
    expect(savedPage.created_at).toBeInstanceOf(Date);
    expect(savedPage.updated_at).toBeInstanceOf(Date);
  });

  it('should create page with minimal input and defaults', async () => {
    const minimalInput: CreatePageInput = {
      title: 'Minimal Page',
      content: 'Just basic content',
      theme: 'light' // Include theme to satisfy TypeScript
    };

    const result = await createPage(minimalInput);

    // Verify the page was created
    const pages = await db.select()
      .from(pagesTable)
      .where(eq(pagesTable.id, result.id))
      .execute();

    const savedPage = pages[0];
    expect(savedPage.title).toBe('Minimal Page');
    expect(savedPage.content).toBe('Just basic content');
    expect(savedPage.hero_image_url).toBeNull();
    expect(savedPage.theme).toBe('light'); // Default theme
  });

  it('should generate unique slugs and secrets', async () => {
    const input1 = { ...testInput, title: 'Page 1' };
    const input2 = { ...testInput, title: 'Page 2' };

    const result1 = await createPage(input1);
    const result2 = await createPage(input2);

    // Verify uniqueness
    expect(result1.public_slug).not.toBe(result2.public_slug);
    expect(result1.edit_secret).not.toBe(result2.edit_secret);
    expect(result1.public_url).not.toBe(result2.public_url);
    expect(result1.edit_url).not.toBe(result2.edit_url);
  });

  it('should handle null hero image URL', async () => {
    const inputWithNullImage: CreatePageInput = {
      title: 'Page Without Image',
      content: 'No hero image here',
      hero_image_url: null,
      theme: 'mint'
    };

    const result = await createPage(inputWithNullImage);

    const pages = await db.select()
      .from(pagesTable)
      .where(eq(pagesTable.id, result.id))
      .execute();

    expect(pages[0].hero_image_url).toBeNull();
  });
});
