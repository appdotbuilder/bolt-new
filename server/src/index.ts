
import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';
import { 
  createPageInputSchema, 
  updatePageInputSchema, 
  getPageBySlugInputSchema, 
  getPageByEditSecretInputSchema 
} from './schema';
import { createPage } from './handlers/create_page';
import { getPageBySlug } from './handlers/get_page_by_slug';
import { getPageByEditSecret } from './handlers/get_page_by_edit_secret';
import { updatePage } from './handlers/update_page';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),
  
  // Create a new page and return publish URLs
  createPage: publicProcedure
    .input(createPageInputSchema)
    .mutation(({ input }) => createPage(input)),
  
  // Get page by public slug (for viewing)
  getPageBySlug: publicProcedure
    .input(getPageBySlugInputSchema)
    .query(({ input }) => getPageBySlug(input)),
  
  // Get page by edit secret (for editing)
  getPageByEditSecret: publicProcedure
    .input(getPageByEditSecretInputSchema)
    .query(({ input }) => getPageByEditSecret(input)),
  
  // Update page using edit secret
  updatePage: publicProcedure
    .input(updatePageInputSchema)
    .mutation(({ input }) => updatePage(input)),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
}

start();
