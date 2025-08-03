
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { pagesTable } from '../db/schema';
import { type UpdatePageInput } from '../schema';
import { updatePage } from '../handlers/update_page';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';

describe('updatePage', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  let testPage: any;

  beforeEach(async () => {
    // Create a test page directly in the database
    const result = await db.insert(pagesTable)
      .values({
        title: 'Original Title',
        content: 'Original content',
        hero_image_url: 'https://example.com/original.jpg',
        theme: 'light',
        public_slug: nanoid(10),
        edit_secret: nanoid(32)
      })
      .returning()
      .execute();
    
    testPage = result[0];
  });

  it('should update page title', async () => {
    const updateInput: UpdatePageInput = {
      edit_secret: testPage.edit_secret,
      title: 'Updated Title'
    };

    const result = await updatePage(updateInput);

    expect(result.title).toEqual('Updated Title');
    expect(result.content).toEqual('Original content'); // Should remain unchanged
    expect(result.hero_image_url).toEqual('https://example.com/original.jpg');
    expect(result.theme).toEqual('light');
    expect(result.id).toEqual(testPage.id);
    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.updated_at > testPage.updated_at).toBe(true);
  });

  it('should update page content', async () => {
    const updateInput: UpdatePageInput = {
      edit_secret: testPage.edit_secret,
      content: 'Updated content with **markdown**'
    };

    const result = await updatePage(updateInput);

    expect(result.content).toEqual('Updated content with **markdown**');
    expect(result.title).toEqual('Original Title'); // Should remain unchanged
    expect(result.updated_at > testPage.updated_at).toBe(true);
  });

  it('should update multiple fields at once', async () => {
    const updateInput: UpdatePageInput = {
      edit_secret: testPage.edit_secret,
      title: 'New Title',
      content: 'New content',
      theme: 'dark',
      hero_image_url: 'https://example.com/new.jpg'
    };

    const result = await updatePage(updateInput);

    expect(result.title).toEqual('New Title');
    expect(result.content).toEqual('New content');
    expect(result.theme).toEqual('dark');
    expect(result.hero_image_url).toEqual('https://example.com/new.jpg');
    expect(result.updated_at > testPage.updated_at).toBe(true);
  });

  it('should clear hero image when set to null', async () => {
    const updateInput: UpdatePageInput = {
      edit_secret: testPage.edit_secret,
      hero_image_url: null
    };

    const result = await updatePage(updateInput);

    expect(result.hero_image_url).toBeNull();
    expect(result.title).toEqual('Original Title'); // Other fields unchanged
  });

  it('should save changes to database', async () => {
    const updateInput: UpdatePageInput = {
      edit_secret: testPage.edit_secret,
      title: 'Database Test Title'
    };

    await updatePage(updateInput);

    // Verify in database
    const pages = await db.select()
      .from(pagesTable)
      .where(eq(pagesTable.id, testPage.id))
      .execute();

    expect(pages).toHaveLength(1);
    expect(pages[0].title).toEqual('Database Test Title');
    expect(pages[0].updated_at).toBeInstanceOf(Date);
    expect(pages[0].updated_at > testPage.updated_at).toBe(true);
  });

  it('should throw error for invalid edit secret', async () => {
    const updateInput: UpdatePageInput = {
      edit_secret: 'invalid-secret-123',
      title: 'Should not work'
    };

    await expect(updatePage(updateInput)).rejects.toThrow(/invalid edit secret/i);
  });

  it('should update only provided fields and leave others unchanged', async () => {
    // Update only theme
    const updateInput: UpdatePageInput = {
      edit_secret: testPage.edit_secret,
      theme: 'corporate'
    };

    const result = await updatePage(updateInput);

    expect(result.theme).toEqual('corporate');
    expect(result.title).toEqual('Original Title');
    expect(result.content).toEqual('Original content');
    expect(result.hero_image_url).toEqual('https://example.com/original.jpg');
    expect(result.public_slug).toEqual(testPage.public_slug);
    expect(result.edit_secret).toEqual(testPage.edit_secret);
  });
});
