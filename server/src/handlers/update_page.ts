
import { db } from '../db';
import { pagesTable } from '../db/schema';
import { type UpdatePageInput, type Page } from '../schema';
import { eq } from 'drizzle-orm';

export const updatePage = async (input: UpdatePageInput): Promise<Page> => {
  try {
    // First, verify the edit secret exists and get the page
    const existingPages = await db.select()
      .from(pagesTable)
      .where(eq(pagesTable.edit_secret, input.edit_secret))
      .execute();

    if (existingPages.length === 0) {
      throw new Error('Invalid edit secret');
    }

    const existingPage = existingPages[0];

    // Build update object with only provided fields
    const updateData: Partial<typeof pagesTable.$inferInsert> = {
      updated_at: new Date() // Use new Date() instead of sql`NOW()`
    };

    if (input.title !== undefined) {
      updateData.title = input.title;
    }

    if (input.content !== undefined) {
      updateData.content = input.content;
    }

    if (input.hero_image_url !== undefined) {
      updateData.hero_image_url = input.hero_image_url;
    }

    if (input.theme !== undefined) {
      updateData.theme = input.theme;
    }

    // Update the page
    const result = await db.update(pagesTable)
      .set(updateData)
      .where(eq(pagesTable.edit_secret, input.edit_secret))
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Page update failed:', error);
    throw error;
  }
};
