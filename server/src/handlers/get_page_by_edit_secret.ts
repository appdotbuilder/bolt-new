
import { db } from '../db';
import { pagesTable } from '../db/schema';
import { type GetPageByEditSecretInput, type Page } from '../schema';
import { eq } from 'drizzle-orm';

export const getPageByEditSecret = async (input: GetPageByEditSecretInput): Promise<Page | null> => {
  try {
    const results = await db.select()
      .from(pagesTable)
      .where(eq(pagesTable.edit_secret, input.edit_secret))
      .execute();

    if (results.length === 0) {
      return null;
    }

    return results[0];
  } catch (error) {
    console.error('Failed to get page by edit secret:', error);
    throw error;
  }
};
