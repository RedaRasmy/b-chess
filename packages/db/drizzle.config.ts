import "dotenv/config"
import { defineConfig } from "drizzle-kit"

const dbURL = process.env.DATABASE_URL

if (!dbURL) {
    throw new Error("DATABASE_URL env variable is missing")
}

export default defineConfig({
    out: "./migrations",
    schema: "./src/schema/index.ts",
    dialect: "postgresql",
    dbCredentials: {
        url: dbURL,
    },
})
