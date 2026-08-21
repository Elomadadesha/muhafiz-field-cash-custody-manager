import { Transaction } from '@/types/app';

const date = (iso: string) => new Date(`${iso}T12:00:00`).getTime();

export const STATION_CUSTODY_NAME = 'عهدة المحطة';

export const STATION_CUSTODY_TRANSACTIONS: Omit<Transaction, 'id' | 'createdAt' | 'walletId'>[] = [
  { type: 'deposit', amount: 3000, date: date('2025-02-20'), categoryId: 'deposit_sys', notes: 'استلام إنستا باي' },
  { type: 'expense', amount: 50, date: date('2025-02-20'), categoryId: 'custom', customCategoryName: 'مواصلات - أندرايف إلى المخرطة مضخة الحقن', notes: 'أندرايف لحد المخرطة مضخة الحقن' },
  { type: 'expense', amount: 40, date: date('2025-02-20'), categoryId: 'custom', customCategoryName: 'مواصلات - أندرايف', notes: 'أندرايف' },
  { type: 'expense', amount: 120, date: date('2025-02-20'), categoryId: 'custom', customCategoryName: 'مواصلات وغسيل فلتر', notes: 'مواصلات وغسيل الفلتر' },
  { type: 'expense', amount: 10, date: date('2025-02-20'), categoryId: 'custom', customCategoryName: 'صيانة', notes: 'سيرفيس' },
  { type: 'expense', amount: 60, date: date('2025-02-20'), categoryId: 'custom', customCategoryName: 'مواصلات', notes: 'مواصلات للمخرطة' },
  { type: 'expense', amount: 100, date: date('2025-02-20'), categoryId: 'custom', customCategoryName: 'مواصلات', notes: 'مواصلات يوم البيرنج مضخة CRN 64' },
  { type: 'expense', amount: 1200, date: date('2025-02-20'), categoryId: 'custom', customCategoryName: 'دومين وبريد إلكتروني', notes: 'تكلفة الدومين والإيميل' },
  { type: 'expense', amount: 350, date: date('2025-02-20'), categoryId: 'custom', customCategoryName: 'تاكسي', notes: 'تاكسي مكادي' },
  { type: 'expense', amount: 35, date: date('2025-02-20'), categoryId: 'custom', customCategoryName: 'مياه', notes: 'زجاجة مياه يوم الموتور الجديد' },
  { type: 'expense', amount: 40, date: date('2025-02-20'), categoryId: 'custom', customCategoryName: 'مستلزمات كهرباء', notes: 'شريطان لحام كهرباء' },
  { type: 'expense', amount: 120, date: date('2025-02-20'), categoryId: 'custom', customCategoryName: 'مواصلات', notes: 'ذهاب وعودة للمخرطة مضخة 2 بعد عيد الأضحى' },
  { type: 'expense', amount: 25, date: date('2025-07-25'), categoryId: 'custom', customCategoryName: 'مستلزمات وصيانة', notes: 'البولي هيد' },
  { type: 'deposit', amount: 1000, date: date('2025-02-20'), categoryId: 'deposit_sys', notes: 'إضافة إلى العهدة' },
  { type: 'expense', amount: 150, date: date('2025-02-20'), categoryId: 'custom', customCategoryName: 'تاكسي', notes: 'تاكسي مكادي فك المحطة' },
  { type: 'expense', amount: 25, date: date('2025-02-20'), categoryId: 'custom', customCategoryName: 'خراطيم', notes: 'خراطيم الحقن من الشحن' },
  { type: 'expense', amount: 150, date: date('2025-02-20'), categoryId: 'custom', customCategoryName: 'نقل واستلام', notes: 'الدريل من جو باص واستلام الفلوس' },
  { type: 'expense', amount: 25, date: date('2025-02-20'), categoryId: 'custom', customCategoryName: 'مواصلات', notes: 'استلام الديفيوز سيستم تكنيك - مواصلات للقرى' },
  { type: 'expense', amount: 120, date: date('2025-02-20'), categoryId: 'custom', customCategoryName: 'تاكسي', notes: 'التاكسي' },
  { type: 'expense', amount: 50, date: date('2025-02-20'), categoryId: 'custom', customCategoryName: 'شيك', notes: 'الشيك للقصير' },
  { type: 'expense', amount: 50, date: date('2025-02-20'), categoryId: 'custom', customCategoryName: 'نقل واستلام', notes: 'استلام الكوع الاستلس من عروس البحر' },
  { type: 'expense', amount: 200, date: date('2025-02-20'), categoryId: 'custom', customCategoryName: 'نقل', notes: 'نقل مانع الترسيب الجديد' },
  { type: 'deposit', amount: 500, date: date('2025-02-20'), categoryId: 'deposit_sys', notes: 'استلام من شغل البولي حمام السباحة' },
  { type: 'expense', amount: 150, date: date('2025-02-20'), categoryId: 'custom', customCategoryName: 'مستلزمات', notes: 'لاكور 2 بوصة' },
  { type: 'expense', amount: 80, date: date('2025-02-20'), categoryId: 'custom', customCategoryName: 'نقل', notes: 'نقل إلى سيستم تكنيك' },
  { type: 'expense', amount: 120, date: date('2025-02-20'), categoryId: 'custom', customCategoryName: 'تاكسي', notes: 'تاكسي للمحطة يوم البئر' },
  { type: 'expense', amount: 200, date: date('2025-02-20'), categoryId: 'custom', customCategoryName: 'شحن', notes: 'شحن الدسبنسر' },
  { type: 'expense', amount: 70, date: date('2025-02-20'), categoryId: 'custom', customCategoryName: 'مواصلات - أندرايف', notes: 'أندرايف' },
  { type: 'expense', amount: 120, date: date('2025-02-20'), categoryId: 'custom', customCategoryName: 'تاكسي', notes: 'تاكسي إلى فندق رواية' },
  { type: 'expense', amount: 50, date: date('2025-02-20'), categoryId: 'custom', customCategoryName: 'شحن', notes: 'استلام شحن حزام فيزلات - بوليصة' },
  { type: 'expense', amount: 50, date: date('2025-02-20'), categoryId: 'custom', customCategoryName: 'مواصلات - أندرايف', notes: 'أندرايف شركة الشحن' },
];
