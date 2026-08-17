import { z } from "zod";

const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d).+$/;
const PASSWORD_MESSAGE = "password must be at least 8 characters and include both letters and numbers";

const passwordSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH, PASSWORD_MESSAGE)
  .regex(PASSWORD_REGEX, PASSWORD_MESSAGE);

export const checkPasswordMatchSchema = z.object({
  password: z.string(),
  passwordConfirm: z.string(),
});

export const signupSchema = z
  .object({
    name: z.string().min(1, "name is required"),
    email: z.string().email("invalid email"),
    password: passwordSchema,
    passwordConfirm: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "passwords do not match",
    path: ["passwordConfirm"],
  });

export const loginSchema = z.object({
  email: z.string().email("invalid email"),
  password: z.string(),
});
