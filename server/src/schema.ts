
import { z } from 'zod';

// Page theme enum
export const pageThemeSchema = z.enum(['light', 'dark', 'mint', 'corporate', 'modern']);
export type PageTheme = z.infer<typeof pageThemeSchema>;

// Page schema for database entity
export const pageSchema = z.object({
  id: z.number(),
  title: z.string(),
  content: z.string(), // Markdown content
  hero_image_url: z.string().nullable(), // URL to uploaded image
  theme: pageThemeSchema,
  public_slug: z.string(), // Public URL slug
  edit_secret: z.string(), // Secret key for editing
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Page = z.infer<typeof pageSchema>;

// Input schema for creating pages
export const createPageInputSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  content: z.string().max(50000, 'Content too long'), // Markdown content
  hero_image_url: z.string().url().nullable().optional(), // Optional image URL
  theme: pageThemeSchema.default('light')
});

export type CreatePageInput = z.infer<typeof createPageInputSchema>;

// Input schema for updating pages
export const updatePageInputSchema = z.object({
  edit_secret: z.string(), // Required for authentication
  title: z.string().min(1, 'Title is required').max(200, 'Title too long').optional(),
  content: z.string().max(50000, 'Content too long').optional(),
  hero_image_url: z.string().url().nullable().optional(),
  theme: pageThemeSchema.optional()
});

export type UpdatePageInput = z.infer<typeof updatePageInputSchema>;

// Schema for getting page by public slug
export const getPageBySlugInputSchema = z.object({
  slug: z.string()
});

export type GetPageBySlugInput = z.infer<typeof getPageBySlugInputSchema>;

// Schema for getting page by edit secret
export const getPageByEditSecretInputSchema = z.object({
  edit_secret: z.string()
});

export type GetPageByEditSecretInput = z.infer<typeof getPageByEditSecretInputSchema>;

// Response schema for published page
export const publishedPageResponseSchema = z.object({
  id: z.number(),
  public_url: z.string(),
  edit_url: z.string(),
  public_slug: z.string(),
  edit_secret: z.string()
});

export type PublishedPageResponse = z.infer<typeof publishedPageResponseSchema>;
