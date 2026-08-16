import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // This installed Prisma version's config only supports a single `url` (no
    // `directUrl` split), so the CLI (migrate/introspect) always uses the DIRECT
    // connection. The app's runtime client (src/lib/db.ts) reads a separate
    // RUNTIME_DATABASE_URL (the pooled connection) instead of going through this file.
    url: env("DIRECT_URL"),
  },
});
