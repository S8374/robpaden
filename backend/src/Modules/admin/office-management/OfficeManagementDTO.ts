import { z } from "zod";

export const createOfficeSchema = {
  body: z.object({
    name: z.string().min(2, "Company name must be at least 2 characters long"),
    timeZone: z.string().optional(),
    officeStartTime: z.string().optional(),
    officeCloseTime: z.string().optional(),
    monthlyGoal: z.coerce.number().min(0).optional(),
  }),
};

export const updateOfficeSettingsSchema = {
  body: z.object({
    companyName: z.string().optional(),
    timeZone: z.string().optional(),
    officeStartTime: z.string().optional(),
    officeCloseTime: z.string().optional(),
    dailyResetTime: z.string().optional(),
    weeklyResetDay: z.coerce.number().min(0).max(6).optional(),
    workWeekEndDay: z.coerce.number().min(0).max(6).optional(),
    weeklyResetTime: z.string().optional(),
    monthlyResetDay: z.coerce.number().min(1).max(31).optional(),
    monthlyGoal: z.coerce.number().min(0).optional(),
    celebrationSound: z.preprocess((val) => val === "true" || val === true, z.boolean()).optional(),
    celebrationStyle: z.string().optional(),
    tvTheme: z.string().optional(),
    tvPassword: z.string().optional(),
    logoUrl: z.any().optional(),
    celebrationSoundUrl: z.any().optional(),
    celebrationSoundStartTime: z.coerce.number().min(0).optional(),
    celebrationSoundDuration: z.coerce.number().min(1).optional(),
    reportRecipients: z.preprocess((val) => {
      if (typeof val === "string") return val.split(",");
      return val;
    }, z.array(z.string().email())).optional(),
  }),
  params: z.object({
    id: z.coerce.number().int().positive("Invalid company ID format"),
  }),
};

export type CreateOfficeDTO = z.infer<typeof createOfficeSchema.body>;
export type UpdateOfficeSettingsBodyDTO = z.infer<typeof updateOfficeSettingsSchema.body>;
export type UpdateOfficeSettingsParamsDTO = z.infer<typeof updateOfficeSettingsSchema.params>;
