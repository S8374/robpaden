import { z } from "zod";

export const loginAdminSchema = {
  body: z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
  }),
};

export type LoginAdminDTO = z.infer<typeof loginAdminSchema.body>;
