import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { encryptData, decryptData } from '@/lib/security';
import { CURRENCIES } from '@/lib/db';
import { RtlWrapper } from '@/components/ui/rtl-wrapper';
import { BottomNav } from '@/components/layout/BottomNav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Trash2, Plus, Wallet, Tag, LogOut, Info, Download, Upload, Shield, Clock, Coins, Settings2, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Wallet as WalletType, Category } from '@/types/app';
import { WalletSchema, CategorySchema } from '@/lib/validation';
export function SettingsPage() {
  const categories = useAppStore(s => s.categories);
  const wallets = useAppStore(s => s.wallets);
  const transactions = useAppStore(s => s.transactions);
  const settings = useAppStore(s => s.settings);
  const addCategory = useAppStore(s => s.addCategory);
  const updateCategory = useAppStore(s => s.updateCategory);
  const deleteCategory = useAppStore(s => s.deleteCategory);
  const addWallet = useAppStore(s => s.addWallet); // Needed if we want to add wallets here too, though dashboard has it
  const renameWallet = useAppStore(s => s.renameWallet);
  const toggleWalletStatus = useAppStore(s => s.toggleWalletStatus);
  const updateSettings = useAppStore(s => s.updateSettings);
  const restoreData = useAppStore(s => s.restoreData);
  const logout = useAppStore(s => s.logout);
  const navigate = useNavigate();
  // Category State
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isAddCatOpen, setIsAddCatOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editCategoryName, setEditCategoryName] = useState('');
  const [isEditCatOpen, setIsEditCatOpen] = useState(false);
  // Wallet State
  const [editingWallet, setEditingWallet] = useState<WalletType | null>(null);
  const [editWalletName, setEditWalletName] = useState('');
  const [isEditWalletOpen, setIsEditWalletOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  // Backup/Restore State
  const [backupPassword, setBackupPassword] = useState('');
  const [isBackupOpen, setIsBackupOpen] = useState(false);
  const [isRestoreOpen, setIsRestoreOpen] = useState(false);
  const [restoreFile, setRestoreFile] = useState<File | null>(null);
  // --- Category Handlers ---
  const handleAddCategory = async () => {
    // Validation
    const validation = CategorySchema.safeParse({ name: newCategoryName });
    if (!validation.success) {
      toast.error(validation.error.issues[0].message);
      return;
    }
    setIsLoading(true);
    try {
      await addCategory(newCategoryName.trim());
      setNewCategoryName('');
      setIsAddCatOpen(false);
      toast.success('تم إضافة البند بنجاح');
    } catch (error) {
      toast.error('فشل إضافة البند');
    } finally {
      setIsLoading(false);
    }
  };
  const openEditCategory = (cat: Category) => {
    setEditingCategory(cat);
    setEditCategoryName(cat.name);
    setIsEditCatOpen(true);
  };
  const handleUpdateCategory = async () => {
    if (!editingCategory) return;
    // Validation
    const validation = CategorySchema.safeParse({ name: editCategoryName });
    if (!validation.success) {
      toast.error(validation.error.issues[0].message);
      return;
    }
    setIsLoading(true);
    try {
      await updateCategory(editingCategory.id, editCategoryName.trim());
      setIsEditCatOpen(false);
      setEditingCategory(null);
      setEditCategoryName('');
      toast.success('تم تعديل البند بنجاح');
    } catch (error) {
      toast.error('فشل تعديل البند');
    } finally {
      setIsLoading(false);
    }
  };
  const handleDeleteCategory = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا البند؟')) {
      try {
        await deleteCategory(id);
        toast.success('تم حذف البند');
      } catch (error) {
        toast.error('لا يمكن حذف هذا البند');
      }
    }
  };
  // --- Wallet Handlers ---
  const openEditWallet = (wallet: WalletType) => {
    setEditingWallet(wallet);
    setEditWalletName(wallet.name);
    setIsEditWalletOpen(true);
  };
  const handleRenameWallet = async () => {
    if (!editingWallet) return;
    // Validation
    const validation = WalletSchema.pick({ name: true }).safeParse({ name: editWalletName });
    if (!validation.success) {
      toast.error(validation.error.issues[0].message);
      return;
    }
    setIsLoading(true);
    try {
      await renameWallet(editingWallet.id, editWalletName.trim());
      setIsEditWalletOpen(false);
      setEditingWallet(null);
      setEditWalletName('');
      toast.success('تم تعديل اسم المحفظة بنجاح');
    } catch (error) {
      toast.error('فشل تعديل المحفظة');
    } finally {
      setIsLoading(false);
    }
  };
  // --- Auth/System Handlers ---
  const handleLogout = () => {
    if (confirm('هل تريد تسجيل الخروج؟')) {
      logout();
      navigate('/login');
    }
  };
  const handleBackup = async () => {
    if (!backupPassword) {
      toast.error('الرجاء إدخال كلمة مرور للتشفي��');
      return;
    }
    setIsLoading(true);
    try {
      const dataToBackup = {
        wallets,
        transactions,
        categories,
        lastUpdated: Date.now()
      };
      const encrypted = await encryptData(dataToBackup, backupPassword);
      // Create download link
      const blob = new Blob([encrypted], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `muhafiz-backup-${format(new Date(), 'yyyy-MM-dd')}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('تم تصدير ال��سخة الاحتياطية بنجاح');
      setIsBackupOpen(false);
      setBackupPassword('');
    } catch (error) {
      console.error(error);
      toast.error('فشل إنشاء ��لنسخة الاحتياطية');
    } finally {
      setIsLoading(false);
    }
  };
  const handleRestore = async () => {
    if (!restoreFile || !backupPassword) return;
    setIsLoading(true);
    try {
      const text = await restoreFile.text();
      const data = await decryptData(text, backupPassword);
      await restoreData(data);
      toast.success('تم استعادة البيانات بنجاح');
      setIsRestoreOpen(false);
      setBackupPassword('');
      setRestoreFile(null);
    } catch (error) {
      console.error(error);
      toast.error('فشل استعادة البيانات. تأكد من كلمة المرور.');
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <RtlWrapper>
      <header className="px-6 pt-8 pb-6 bg-white dark:bg-slate-900 sticky top-0 z-10 border-b border-slate-50 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600 dark:text-blue-400">
            <Settings2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">الإعدادات</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">تخصيص التطبيق والأم��ن</p>
          </div>
        </div>
      </header>
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8 pb-24">
        {/* General Settings */}
        <section>
          <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold mb-4">
            <Coins className="w-5 h-5 text-blue-600" />
            <h2>إعدادات عامة</h2>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden p-4 space-y-4">
            {/* Currency Selector */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600">
                  <span className="text-xs font-bold">$</span>
                </div>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">عم��ة التطبيق</span>
              </div>
              <Select 
                value={settings.currency} 
                onValueChange={(v: any) => updateSettings({ currency: v })}
              >
                <SelectTrigger className="w-36 h-9 text-xs bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700" dir="rtl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent dir="rtl">
                  {Object.entries(CURRENCIES).map(([key, val]) => (
                    <SelectItem key={key} value={key}>
                      {val.label} ({val.symbol})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>
        {/* Security Section */}
        <section>
          <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold mb-4">
            <Shield className="w-5 h-5 text-blue-600" />
            <h2>الأمان والنسخ الاحتياطي</h2>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden p-4 space-y-4">
            {/* Auto Lock */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600">
                  <Clock className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">القفل التلقائي</span>
              </div>
              <Select 
                value={settings.autoLockMinutes.toString()} 
                onValueChange={(v) => updateSettings({ autoLockMinutes: parseInt(v) })}
              >
                <SelectTrigger className="w-36 h-9 text-xs bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700" dir="rtl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent dir="rtl">
                  <SelectItem value="0">معطل</SelectItem>
                  <SelectItem value="1">دقيقة واحدة</SelectItem>
                  <SelectItem value="2">دقيقتين</SelectItem>
                  <SelectItem value="5">5 دقائق</SelectItem>
                  <SelectItem value="10">10 دقائق</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="h-px bg-slate-50 dark:bg-slate-700" />
            {/* Backup & Restore Buttons */}
            <div className="grid grid-cols-2 gap-3">
              {/* Backup Dialog */}
              <Dialog open={isBackupOpen} onOpenChange={setIsBackupOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="gap-2 h-10 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800">
                    <Download className="w-4 h-4 text-blue-600" />
                    نسخ احتياطي
                  </Button>
                </DialogTrigger>
                <DialogContent dir="rtl">
                  <DialogHeader>
                    <DialogTitle className="text-right">تصدير نسخة احتياطية</DialogTitle>
                    <DialogDescription className="text-right text-slate-500">
                      قم بإنشاء مل�� نسخة احتياطية مشفر لحفظ بياناتك بأمان.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <p className="text-sm text-slate-500 bg-blue-50 p-3 rounded-xl border border-blue-100">
                      سيتم تشفير بياناتك بكلمة مرور. يجب عليك تذكر هذه الكلمة لاستعادة البيانات لاحقاً.
                    </p>
                    <div className="space-y-2">
                      <Label className="text-right block">كلمة مرور التشفير</Label>
                      <Input
                        type="password"
                        value={backupPassword}
                        onChange={(e) => setBackupPassword(e.target.value)}
                        placeholder="أدخل كلمة مرور قوية"
                        className="text-center h-12 rounded-xl"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleBackup} disabled={isLoading || !backupPassword} className="w-full bg-blue-600 h-12 rounded-xl">
                      {isLoading ? 'جاري الت��دير...' : 'تصدير وحفظ'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              {/* Restore Dialog */}
              <Dialog open={isRestoreOpen} onOpenChange={setIsRestoreOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="gap-2 h-10 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800">
                    <Upload className="w-4 h-4 text-blue-600" />
                    استعادة
                  </Button>
                </DialogTrigger>
                <DialogContent dir="rtl">
                  <DialogHeader>
                    <DialogTitle className="text-right">استعادة نسخة احتياطية</DialogTitle>
                    <DialogDescription className="text-right text-slate-500">
                      اختر ملف النسخة الاحتياطية وأدخل كلمة المرور لاسترجاع البيانات.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <p className="text-sm text-red-600 bg-red-50 p-3 rounded-xl border border-red-100">
                      تنبيه: استعادة البيانات ستقوم باستبدال جميع البيانات الحالية!
                    </p>
                    <div className="space-y-2">
                      <Label className="text-right block">ملف النسخة الاحتياطية</Label>
                      <Input
                        type="file"
                        accept=".json"
                        onChange={(e) => setRestoreFile(e.target.files?.[0] || null)}
                        className="text-right h-12 pt-2 rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-right block">كلمة مرور فك التشفير</Label>
                      <Input
                        type="password"
                        value={backupPassword}
                        onChange={(e) => setBackupPassword(e.target.value)}
                        placeholder="أدخل كلمة المرور"
                        className="text-center h-12 rounded-xl"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleRestore} disabled={isLoading || !backupPassword || !restoreFile} className="w-full bg-blue-600 h-12 rounded-xl">
                      {isLoading ? 'جاري الاستعادة...' : 'استعادة البيانات'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </section>
        {/* Categories Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold">
              <Tag className="w-5 h-5 text-blue-600" />
              <h2>بنود الصرف</h2>
            </div>
            <Dialog open={isAddCatOpen} onOpenChange={setIsAddCatOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 text-xs rounded-lg">
                  <Plus className="w-3 h-3 ml-1 text-blue-600" />
                  إضافة
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md" dir="rtl">
                <DialogHeader>
                  <DialogTitle className="text-right">إضافة بند صرف جديد</DialogTitle>
                  <DialogDescription className="text-right text-slate-500">
                    أدخل اسم البند الجديد ل��ضافته إلى قائمة المصروفات.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <Label className="text-right block mb-2">اسم البند</Label>
                  <Input
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="مثال: ضيافة"
                    className="text-right h-12 rounded-xl"
                  />
                </div>
                <DialogFooter>
                  <Button onClick={handleAddCategory} disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 h-12 rounded-xl">
                    {isLoading ? 'جاري الحفظ...' : 'حفظ'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
            {categories.map((cat, index) => (
              <div 
                key={cat.id} 
                className={`flex items-center justify-between p-3 ${index !== categories.length - 1 ? 'border-b border-slate-50 dark:border-slate-700' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-700 flex items-center justify-center text-slate-500">
                    <Tag className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{cat.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  {/* Edit Button for All Categories */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                    onClick={() => openEditCategory(cat)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  {cat.isSystem ? (
                    <span className="text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-400 px-2 py-1 rounded-full ml-1">نظام</span>
                  ) : (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteCategory(cat.id)}
                      className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
          {/* Edit Category Dialog */}
          <Dialog open={isEditCatOpen} onOpenChange={setIsEditCatOpen}>
            <DialogContent className="sm:max-w-md" dir="rtl">
              <DialogHeader>
                <DialogTitle className="text-right">تعديل اسم البند</DialogTitle>
                <DialogDescription className="text-right text-slate-500">
                  قم بتغيير اسم بند الصرف. سيتم تحديث الاسم في جميع التقارير.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <Label className="text-right block mb-2">اسم البند</Label>
                <Input
                  value={editCategoryName}
                  onChange={(e) => setEditCategoryName(e.target.value)}
                  placeholder="اسم البند الجديد"
                  className="text-right h-12 rounded-xl"
                />
              </div>
              <DialogFooter>
                <Button onClick={handleUpdateCategory} disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 h-12 rounded-xl">
                  {isLoading ? 'جاري الحفظ...' : 'حفظ التعديلات'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </section>
        {/* Wallets Section */}
        <section>
          <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold mb-4">
            <Wallet className="w-5 h-5 text-blue-600" />
            <h2>إدارة العُهد</h2>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
            {wallets.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-sm">لا ت��جد عُهد مسجلة</div>
            ) : (
              wallets.map((wallet, index) => (
                <div 
                  key={wallet.id} 
                  className={`flex items-center justify-between p-3 ${index !== wallets.length - 1 ? 'border-b border-slate-50 dark:border-slate-700' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${wallet.isActive ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-400'}`}>
                      <Wallet className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{wallet.name}</p>
                      <p className="text-xs text-slate-400">{wallet.balance.toLocaleString()} {CURRENCIES[settings.currency].symbol}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                      onClick={() => openEditWallet(wallet)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Switch 
                      checked={wallet.isActive} 
                      onCheckedChange={() => toggleWalletStatus(wallet.id)} 
                    />
                  </div>
                </div>
              ))
            )}
          </div>
          {/* Edit Wallet Dialog */}
          <Dialog open={isEditWalletOpen} onOpenChange={setIsEditWalletOpen}>
            <DialogContent className="sm:max-w-md" dir="rtl">
              <DialogHeader>
                <DialogTitle className="text-right">تعديل اسم المحفظة</DialogTitle>
                <DialogDescription className="text-right text-slate-500">
                  قم بتغيير اسم العُهدة. لن يتأثر الرصيد أو العمليات السابقة.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <Label className="text-right block mb-2">اسم المحفظة</Label>
                <Input
                  value={editWalletName}
                  onChange={(e) => setEditWalletName(e.target.value)}
                  placeholder="اسم المحفظة الجديد"
                  className="text-right h-12 rounded-xl"
                />
              </div>
              <DialogFooter>
                <Button onClick={handleRenameWallet} disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 h-12 rounded-xl">
                  {isLoading ? 'جاري الحفظ...' : 'حفظ التعديلات'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </section>
        {/* App Info & Logout */}
        <section className="pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 mb-4 border border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 mb-2">
              <Info className="w-4 h-4" />
              <span className="text-sm font-bold">عن التطبيق</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-500 leading-relaxed">
              تطبيق Abu MaWaDa - الإصدار المحلي الآمن v2.0.0
              <br />
              جميع البيانات محفوظة على جهازك فقط.
            </p>
          </div>
          <Button 
            variant="destructive" 
            className="w-full gap-2 h-12 rounded-xl shadow-lg shadow-red-500/10"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4" />
            تسجيل الخروج
          </Button>
        </section>
      </div>
      <BottomNav />
    </RtlWrapper>
  );
}