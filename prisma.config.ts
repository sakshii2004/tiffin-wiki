import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    // To seed: npm run db:seed (requires prisma/seed.ts)
  },
  datasource: {
    // Use the DIRECT (non-pooled) URL for CLI / migration commands.
    // At runtime, the application uses DATABASE_URL (pooled) via the Neon adapter in lib/prisma.ts.
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? "",
  },
});
