import { z } from "zod";

export const inviteAgentSchema = {
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email format"),
    password: z.string().optional(),
    avatarUrl: z.string().url().optional().or(z.literal("")),
    dailyGoal: z.number().int().nonnegative().optional(),
    weeklyGoal: z.number().int().nonnegative().optional(),
    monthlyGoal: z.number().int().nonnegative().optional(),
  })
};

export type InviteAgentDTO = z.infer<typeof inviteAgentSchema.body>;

export const updateAgentSchema = {
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters").optional(),
    email: z.string().email("Invalid email format").optional(),
    password: z.string().optional(),
    avatarUrl: z.string().url().optional().or(z.literal("")),
    dailyGoal: z.number().int().nonnegative().optional(),
    weeklyGoal: z.number().int().nonnegative().optional(),
    monthlyGoal: z.number().int().nonnegative().optional(),
    isActive: z.boolean().optional(),
  })
};

export type UpdateAgentDTO = z.infer<typeof updateAgentSchema.body>;
