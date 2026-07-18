import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
});

export const signupSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  dob: z.string().min(1, 'Date of birth is required'),
  gender: z.string().min(1, 'Select gender'),
  bloodGroup: z.string().min(1, 'Select blood group'),
  mobile: z.string().min(10, 'Enter a valid mobile number'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const appointmentSchema = z.object({
  doctorId: z.string().min(1),
  date: z.string().min(1, 'Select a date'),
  time: z.string().min(1, 'Select a time'),
  symptoms: z.string().min(3, 'Describe your symptoms'),
});

export type LoginForm = z.infer<typeof loginSchema>;
export type SignupForm = z.infer<typeof signupSchema>;
export type AppointmentForm = z.infer<typeof appointmentSchema>;
