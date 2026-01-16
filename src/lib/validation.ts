import { z } from 'zod';
export const LoginSchema = z.object({
  pin: z.string()
    .min(4, { message: "كلمة المرور يجب أن تكون 4 أرقام على الأقل" })
    .regex(/^\d+$/, { message: "كلمة المرور يجب أن تحتوي على أرقام فقط" })
});
export const WalletSchema = z.object({
  name: z.string()
    .min(1, { message: "اسم ��لمحفظة مطلوب" })
    .max(50, { message: "اسم المحفظة طويل جداً" }),
  initialBalance: z.number({ invalid_type_error: "الرصيد يجب أن يكون رقماً" })
    .min(0, { message: "الرصيد لا يمكن أن يكون سالباً" })
});
export const CategorySchema = z.object({
  name: z.string()
    .min(1, { message: "اسم البند مطلوب" })
    .max(30, { message: "اسم البند طويل جداً" })
    .regex(/^[\p{L}\p{N}\s\-_]+$/u, { message: "اسم البند يحتوي على رم��ز غير مسموحة" })
});
export const TransactionSchema = z.object({
  amount: z.number({ invalid_type_error: "المبلغ يجب أن يكون رقماً" })
    .positive({ message: "المبلغ يجب أن يكون أكبر من صفر" }),
  notes: z.string()
    .max(100, { message: "الملاحظات طويلة جداً (ال��د الأقصى 100 حرف)" })
    .optional(),
  date: z.date({ required_error: "التاريخ مطلوب", invalid_type_error: "تاريخ غير صالح" })
});