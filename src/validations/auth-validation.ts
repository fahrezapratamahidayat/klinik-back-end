import { z } from "zod"

export const loginValidation = z.object({
  email: z.string({
    required_error: "Email tidak boleh kosong",
    invalid_type_error: "Email tidak valid",
  }).email({
    message: "Email tidak valid",
  }),
  password: z.string({
    message: "Password tidak boleh kosong",
  }),
});
