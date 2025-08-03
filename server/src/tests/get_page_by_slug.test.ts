
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { pagesTable } from '../db/schema';
import { type GetPageBySlugInput, type CreatePageInput } from '../schema';
import { getPageBySlug } from '../handlers/get_page_by_slug';
import { nanoid } from 'nanoid';

// Helper to create a test page
const createTestPage = async () => {
  const publicSlug = `test-page-${nanoid(8)}`;
  const editSecret = `edit-${nanoid(16)}`;
  
  const result = await db.insert(pagesTable)
    .values({
      title: 'Test Page',
      content: '# Test Content\n\nThis is a test page with markdown content.',
      hero_image_url: 'https://example.com/hero.jpg',
      theme: 'light',
      public_slug: publicSlug,
      edit_secret: editSecret
    })
    .returning()
    .execute();

  return result[0];
};

describe('getPageBySlug', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should retrieve a page by public slug', async () => {
    const testPage = await createTestPage();
    const input: GetPageBySlugInput = {
      slug: testPage.public_slug
    };

    const result = await getPageBySlug(input);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(testPage.id);
    expect(result!.title).toEqual('Test Page');
    expect(result!.content).toEqual('# Test Content\n\nThis is a test page with markdown content.');
    expect(result!.hero_image_url).toEqual('https://example.com/hero.jpg');
    expect(result!.theme).toEqual('light');
    expect(result!.public_slug).toEqual(testPage.public_slug);
    expect(result!.edit_secret).toEqual(testPage.edit_secret);
    expect(result!.created_at).toBeInstanceOf(Date);
    expect(result!.updated_at).toBeInstanceOf(Date);
  });

  it('should return null for non-existent slug', async () => {
    const input: GetPageBySlugInput = {
      slug: 'non-existent-slug'
    };

    const result = await getPageBySlug(input);

    expect(result).toBeNull();
  });

  it('should retrieve the correct page when multiple pages exist', async () => {
    // Create multiple test pages
    const page1 = await createTestPage();
    const page2 = await createTestPage();
    const page3 = await createTestPage();

    const input: GetPageBySlugInput = {
      slug: page2.public_slug
    };

    const result = await getPageBySlug(input);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(page2.id);
    expect(result!.public_slug).toEqual(page2.public_slug);
    expect(result!.title).toEqual('Test Page');
  });

  it('should handle pages with null hero_image_url', async () => {
    const publicSlug = `test-page-${nanoid(8)}`;
    const editSecret = `edit-${nanoid(16)}`;
    
    const testPage = await db.insert(pagesTable)
      .values({
        title: 'Page Without Hero',
        content: '# No Hero Image\n\nThis page has no hero image.',
        hero_image_url: null,
        theme: 'dark',
        public_slug: publicSlug,
        edit_secret: editSecret
      })
      .returning()
      .execute();

    const input: GetPageBySlugInput = {
      slug: publicSlug
    };

    const result = await getPageBySlug(input);

    expect(result).not.toBeNull();
    expect(result!.hero_image_url).toBeNull();
    expect(result!.theme).toEqual('dark');
    expect(result!.title).toEqual('Page Without Hero');
  });
});
