
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { pagesTable } from '../db/schema';
import { type GetPageByEditSecretInput } from '../schema';
import { getPageByEditSecret } from '../handlers/get_page_by_edit_secret';

// Test input
const testInput: GetPageByEditSecretInput = {
  edit_secret: 'test-edit-secret-123'
};

describe('getPageByEditSecret', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return page when edit secret exists', async () => {
    // Create test page
    const [page] = await db.insert(pagesTable)
      .values({
        title: 'Test Page',
        content: '# Test Content',
        hero_image_url: 'https://example.com/image.jpg',
        theme: 'light',
        public_slug: 'test-page',
        edit_secret: 'test-edit-secret-123'
      })
      .returning()
      .execute();

    const result = await getPageByEditSecret(testInput);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(page.id);
    expect(result!.title).toEqual('Test Page');
    expect(result!.content).toEqual('# Test Content');
    expect(result!.hero_image_url).toEqual('https://example.com/image.jpg');
    expect(result!.theme).toEqual('light');
    expect(result!.public_slug).toEqual('test-page');
    expect(result!.edit_secret).toEqual('test-edit-secret-123');
    expect(result!.created_at).toBeInstanceOf(Date);
    expect(result!.updated_at).toBeInstanceOf(Date);
  });

  it('should return null when edit secret does not exist', async () => {
    const result = await getPageByEditSecret({
      edit_secret: 'nonexistent-secret'
    });

    expect(result).toBeNull();
  });

  it('should return correct page when multiple pages exist', async () => {
    // Create multiple test pages
    await db.insert(pagesTable)
      .values([
        {
          title: 'First Page',
          content: '# First',
          theme: 'light',
          public_slug: 'first-page',
          edit_secret: 'first-secret'
        },
        {
          title: 'Target Page',
          content: '# Target Content',
          theme: 'dark',
          public_slug: 'target-page',
          edit_secret: 'test-edit-secret-123'
        },
        {
          title: 'Third Page',
          content: '# Third',
          theme: 'mint',
          public_slug: 'third-page',
          edit_secret: 'third-secret'
        }
      ])
      .execute();

    const result = await getPageByEditSecret(testInput);

    expect(result).not.toBeNull();
    expect(result!.title).toEqual('Target Page');
    expect(result!.content).toEqual('# Target Content');
    expect(result!.theme).toEqual('dark');
    expect(result!.public_slug).toEqual('target-page');
    expect(result!.edit_secret).toEqual('test-edit-secret-123');
  });

  it('should handle page with null hero_image_url', async () => {
    // Create test page without hero image
    await db.insert(pagesTable)
      .values({
        title: 'No Image Page',
        content: '# No Image',
        hero_image_url: null,
        theme: 'corporate',
        public_slug: 'no-image-page',
        edit_secret: 'test-edit-secret-123'
      })
      .execute();

    const result = await getPageByEditSecret(testInput);

    expect(result).not.toBeNull();
    expect(result!.title).toEqual('No Image Page');
    expect(result!.hero_image_url).toBeNull();
    expect(result!.theme).toEqual('corporate');
  });
});
