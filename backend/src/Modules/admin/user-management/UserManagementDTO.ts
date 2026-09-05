import { z } from "zod";

export const inviteUserSchema = {
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters long").optional().or(z.literal("")),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
    role: z.enum(["MANAGER", "AGENT"]),
    companyId: z.coerce.number().int().positive().optional(),
    managerId: z.coerce.number().int().positive().optional(),
    agentLimit: z.coerce.number().int().nonnegative().optional(),
    avatarUrl: z.string().optional(),
  }).refine(
    (data) => {
      if (data.role === "MANAGER" && !data.companyId) {
        return false;
      }
      return true;
    },
    {
      message: "A Manager must be assigned to a specific company (companyId is required).",
      path: ["companyId"],
    }
  ),
};

export type InviteUserDTO = z.infer<typeof inviteUserSchema.body>;

export const updateUserSchema = {
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters long").optional().or(z.literal("")),
    email: z.string().email("Invalid email address").optional(),
    password: z.string().min(6, "Password must be at least 6 characters long").optional(),
    role: z.enum(["MANAGER", "AGENT"]).optional(),
    companyId: z.coerce.number().int().positive().nullable().optional(),
    managerId: z.coerce.number().int().positive().nullable().optional(),
    agentLimit: z.coerce.number().int().nonnegative().nullable().optional(),
    avatarUrl: z.string().optional(),
  })
};

export type UpdateUserDTO = z.infer<typeof updateUserSchema.body>;

export const updateUserStatusSchema = {
  body: z.object({
    isActive: z.boolean()
  })
};

export type UpdateUserStatusDTO = z.infer<typeof updateUserStatusSchema.body>;
