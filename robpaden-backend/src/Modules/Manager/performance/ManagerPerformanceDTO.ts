import { z } from "zod";

export const addDailySalesSchema = {
  body: z.object({
    agentId: z.number().int().positive("Valid agent ID is required"),
    date: z.string().datetime("Date must be a valid ISO-8601 string"),
    salesCount: z.number().int().nonnegative("Sales count cannot be negative"),
  }),
};

export type AddDailySalesDTO = z.infer<typeof addDailySalesSchema.body>;

export const editSaleSchema = {
  body: z.object({
    newCount: z.number().int().nonnegative("Sales count cannot be negative"),
  }),
};

export type EditSaleDTO = z.infer<typeof editSaleSchema.body>;
