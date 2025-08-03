
import { db } from '../db';
import { pagesTable } from '../db/schema';
import { type CreatePageInput, type PublishedPageResponse } from '../schema';
import { nanoid } from 'nanoid';

export const createPage = async (input: CreatePageInput): Promise<PublishedPageResponse> => {
  try {
    // Generate unique identifiers
    const publicSlug = nanoid(12); // Short, URL-safe identifier
    const editSecret = nanoid(32); // Longer secret for editing

    // Insert page record
    const result = await db.insert(pagesTable)
      .values({
        title: input.title,
        content: input.content,
        hero_image_url: input.hero_image_url || null,
        theme: input.theme || 'light', // Use Zod default
        public_slug: publicSlug,
        edit_secret: editSecret
      })
      .returning()
      .execute();

    const page = result[0];

    // Generate URLs
    const baseUrl = process.env['CLIENT_URL'] || 'http://localhost:3000';
    
    return {
      id: page.id,
      public_url: `${baseUrl}/${publicSlug}`,
      edit_url: `${baseUrl}/edit/${editSecret}`,
      public_slug: publicSlug,
      edit_secret: editSecret
    };
  } catch (error) {
    console.error('Page creation failed:', error);
    throw error;
  }
};
