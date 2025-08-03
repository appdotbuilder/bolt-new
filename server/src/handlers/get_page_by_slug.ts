
import { db } from '../db';
import { pagesTable } from '../db/schema';
import { eq } from 'drizzle-orm';
import { type GetPageBySlugInput, type Page } from '../schema';

export const getPageBySlug = async (input: GetPageBySlugInput): Promise<Page | null> => {
  try {
    const results = await db.select()
      .from(pagesTable)
      .where(eq(pagesTable.public_slug, input.slug))
      .execute();

    if (results.length === 0) {
      return null;
    }

    return results[0];
  } catch (error) {
    console.error('Failed to get page by slug:', error);
    throw error;
  }
};
