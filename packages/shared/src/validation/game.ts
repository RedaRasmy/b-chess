import z from "zod"
import { createInsertSchema, createSelectSchema } from "drizzle-zod"
import { games } from "@bchess/db/tables"

export const InsertGameSchema = createInsertSchema(games).pick({
    timer: true,
})
export const SelectGameSchema = createSelectSchema(games)

export type Game = z.infer<typeof SelectGameSchema>

export type IGame = z.infer<typeof InsertGameSchema>
