
import { serial, text, pgTable, timestamp, pgEnum } from 'drizzle-orm/pg-core';

// Define the theme enum for PostgreSQL
export const pageThemeEnum = pgEnum('page_theme', ['light', 'dark', 'mint', 'corporate', 'modern']);

export const pagesTable = pgTable('pages', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  content: text('content').notNull(), // Markdown content
  hero_image_url: text('hero_image_url'), // Nullable by default - URL to uploaded image
  theme: pageThemeEnum('theme').notNull().default('light'),
  public_slug: text('public_slug').notNull().unique(), // Unique public URL slug
  edit_secret: text('edit_secret').notNull().unique(), // Unique secret key for editing
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// TypeScript types for the table schema
export type Page = typeof pagesTable.$inferSelect; // For SELECT operations
export type NewPage = typeof pagesTable.$inferInsert; // For INSERT operations

// Export all tables for proper query building
export const tables = { pages: pagesTable };
