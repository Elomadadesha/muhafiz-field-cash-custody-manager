import { useState, useRef } from 'react';
import { useAppStore } from '@/lib/store';
import { encryptData, decryptData } from '@/lib/security';
import { RtlWrapper } from '@/components/ui/rtl-wrapper';
import { BottomNav } from '@/components/layout/BottomNav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Trash2, Plus, Wallet, Tag, LogOut, Info, Download, Upload, Shield, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
export function SettingsPage() {
  const categories = useAppStore(s => s.categories);
  const wallets = useAppStore(s => s.wallets);
  const transactions = useAppStore(s => s.transactions);
  const settings = useAppStore(s => s.settings);
  const addCategory = useAppStore(s => s.addCategory);
  const deleteCategory = useAppStore(s => s.deleteCategory);
  const toggleWalletStatus = useAppStore(s => s.toggleWalletStatus);
  const updateSettings = useAppStore(s => s.updateSettings);
  const restoreData = useAppStore(s => s.restoreData);
  const logout = useAppStore(s => s.logout);
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isAddCatOpen, setIsAddCatOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  // Backup/Restore State
  const [backupPassword, setBackupPassword] = useState('');
  const [isBackupOpen, setIsBackupOpen] = useState(false);
  const [isRestoreOpen, setIsRestoreOpen] = useState(false);
  const [restoreFile, setRestoreFile] = useState<File | null>(null);
  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    setIsLoading(true);
    try {
      await addCategory(newCategoryName.trim());
      setNewCategoryName('');
      setIsAddCatOpen(false);
      toast.success('تم ��ضافة البند بنجاح');
    } catch (error) {
      toast.error('فشل إضافة البند');
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
  const handleLogout = () => {
    if (confirm('هل تريد تسجيل الخروج؟')) {
      logout();
      navigate('/login');
    }
  };
  const handleBackup = async () => {
    if (!backupPassword) {
      toast.error('الرجاء إدخ��ل كلمة مرور للتشفير');
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
      toast.success('تم تصدير النسخة الا��تياطية بنجاح');
      setIsBackupOpen(false);
      setBackupPassword('');
    } catch (error) {
      console.error(error);
      toast.error('فشل إنشاء النسخة الاحتياطية');
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
      toast.success('تم استعادة الب��انات بنجاح');
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
      <header className="px-6 pt-8 pb-4">
        <h1 className="text-xl font-bold text-slate-900">الإع��ادات</h1>
        <p className="text-sm text-slate-500">تخصيص التطبيق والأمان</p>
      </header>
      <div className="flex-1 overflow-y-auto px-6 pb-24 space-y-8">
        {/* Security Section */}
        <section>
          <div className="flex items-center gap-2 text-slate-900 font-bold mb-4">
            <Shield className="w-5 h-5 text-blue-600" />
            <h2>الأمان والنسخ الاحتياطي</h2>
          </div>
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden p-4 space-y-4">
            {/* Auto Lock */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" />
                <span className="text-sm font-medium text-slate-700">القفل التلقائي</span>
              </div>
              <Select 
                value={settings.autoLockMinutes.toString()} 
                onValueChange={(v) => updateSettings({ autoLockMinutes: parseInt(v) })}
              >
                <SelectTrigger className="w-32 h-8 text-xs" dir="rtl">
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
            <div className="h-px bg-slate-50" />
            {/* Backup & Restore Buttons */}
            <div className="grid grid-cols-2 gap-3">
              {/* Backup Dialog */}
              <Dialog open={isBackupOpen} onOpenChange={setIsBackupOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="gap-2 h-10">
                    <Download className="w-4 h-4" />
                    نسخ احتياطي
                  </Button>
                </DialogTrigger>
                <DialogContent dir="rtl">
                  <DialogHeader>
                    <DialogTitle className="text-right">تصدير نسخة احتياطية</DialogTitle>
                    <DialogDescription className="text-right text-slate-500">
                      قم بإنشاء ملف نسخة احتياطية مشفر لحفظ بياناتك بأمان.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <p className="text-sm text-slate-500">
                      سيتم تشفير بياناتك بكلمة مرور. يجب عليك تذ��ر هذه الكلمة لاستعادة البيانات لاحقاً.
                    </p>
                    <div className="space-y-2">
                      <Label className="text-right block">كلمة مرور التشفير</Label>
                      <Input
                        type="password"
                        value={backupPassword}
                        onChange={(e) => setBackupPassword(e.target.value)}
                        placeholder="أدخل كلمة مرور قوية"
                        className="text-center"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleBackup} disabled={isLoading || !backupPassword} className="w-full bg-blue-600">
                      {isLoading ? 'جاري التصدير...' : 'تصدير وحفظ'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              {/* Restore Dialog */}
              <Dialog open={isRestoreOpen} onOpenChange={setIsRestoreOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="gap-2 h-10">
                    <Upload className="w-4 h-4" />
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
                    <p className="text-sm text-red-500 bg-red-50 p-2 rounded-lg">
                      تنبيه: استعادة البيانات ستقوم باستبدال جميع البيانات الحالية!
                    </p>
                    <div className="space-y-2">
                      <Label className="text-right block">ملف النسخة الاحتياطية</Label>
                      <Input
                        type="file"
                        accept=".json"
                        onChange={(e) => setRestoreFile(e.target.files?.[0] || null)}
                        className="text-right"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-right block">كلمة مرور فك التشفير</Label>
                      <Input
                        type="password"
                        value={backupPassword}
                        onChange={(e) => setBackupPassword(e.target.value)}
                        placeholder="أدخل كلمة المرور"
                        className="text-center"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleRestore} disabled={isLoading || !backupPassword || !restoreFile} className="w-full bg-blue-600">
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
            <div className="flex items-center gap-2 text-slate-900 font-bold">
              <Tag className="w-5 h-5 text-blue-600" />
              <h2>بنود الصرف</h2>
            </div>
            <Dialog open={isAddCatOpen} onOpenChange={setIsAddCatOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 text-xs">
                  <Plus className="w-3 h-3 ml-1" />
                  إضافة
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md" dir="rtl">
                <DialogHeader>
                  <DialogTitle className="text-right">إضافة بند صرف جدي��</DialogTitle>
                  <DialogDescription className="text-right text-slate-500">
                    أدخل اسم البند الجديد لإضافته إلى قائمة المصروفات.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <Label className="text-right block mb-2">اسم البند</Label>
                  <Input
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="مثال: ضيافة"
                    className="text-right"
                  />
                </div>
                <DialogFooter>
                  <Button onClick={handleAddCategory} disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700">
                    {isLoading ? 'جاري الحفظ...' : 'حفظ'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
            {categories.map((cat, index) => (
              <div
                key={cat.id}
                className={`flex items-center justify-between p-3 ${index !== categories.length - 1 ? 'border-b border-slate-50' : ''}`}
              >
                <span className="text-sm font-medium text-slate-700">{cat.name}</span>
                {cat.isSystem ? (
                  <span className="text-[10px] bg-slate-100 text-slate-400 px-2 py-1 rounded-full">نظام</span>
                ) : (
                  <button
                    onClick={() => handleDeleteCategory(cat.id)}
                    className="text-red-400 hover:text-red-600 p-1 rounded-md hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>
        {/* Wallets Section */}
        <section>
          <div className="flex items-center gap-2 text-slate-900 font-bold mb-4">
            <Wallet className="w-5 h-5 text-blue-600" />
            <h2>إدارة العُهد</h2>
          </div>
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
            {wallets.length === 0 ? (
              <div className="p-4 text-center text-slate-400 text-sm">لا توجد عُهد مسجلة</div>
            ) : (
              wallets.map((wallet, index) => (
                <div
                  key={wallet.id}
                  className={`flex items-center justify-between p-3 ${index !== wallets.length - 1 ? 'border-b border-slate-50' : ''}`}
                >
                  <div>
                    <p className="text-sm font-medium text-slate-700">{wallet.name}</p>
                    <p className="text-xs text-slate-400">{wallet.balance.toLocaleString()} ر.س</p>
                  </div>
                  <Switch
                    checked={wallet.isActive}
                    onCheckedChange={() => toggleWalletStatus(wallet.id)}
                  />
                </div>
              ))
            )}
          </div>
        </section>
        {/* App Info & Logout */}
        <section className="pt-4 border-t border-slate-100">
          <div className="bg-slate-50 rounded-xl p-4 mb-4">
            <div className="flex items-center gap-2 text-slate-600 mb-2">
              <Info className="w-4 h-4" />
              <span className="text-sm font-bold">عن التطبي��</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              تطبيق مُحافظ - الإصدار المحلي الآمن v2.0.0
              <br />
              جميع البيانات محفوظة على جها��ك فقط.
            </p>
          </div>
          <Button
            variant="destructive"
            className="w-full gap-2"
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