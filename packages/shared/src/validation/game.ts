import z from "zod"
import { createInsertSchema, createSelectSchema } from "drizzle-zod"
import { games } from "@bchess/db/tables"

export const InsertGameSchema = createInsertSchema(games).pick({
    timer: true,
})
export const SelectGameSchema = createSelectSchema(games)

export type Game = z.infer<typeof SelectGameSchema>

export type IGame = z.infer<typeof InsertGameSchema>

export const MoveSchema = z.object({
    from: z.string().length(2),
    to: z.string().length(2),
    promotion: z.string().length(1).optional(),
})
