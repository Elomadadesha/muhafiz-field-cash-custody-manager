import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { RtlWrapper } from '@/components/ui/rtl-wrapper';
import { BottomNav } from '@/components/layout/BottomNav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Trash2, Plus, Wallet, Tag, LogOut, Info } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
export function SettingsPage() {
  const categories = useAppStore(s => s.categories);
  const wallets = useAppStore(s => s.wallets);
  const addCategory = useAppStore(s => s.addCategory);
  const deleteCategory = useAppStore(s => s.deleteCategory);
  const toggleWalletStatus = useAppStore(s => s.toggleWalletStatus);
  const logout = useAppStore(s => s.logout);
  const navigate = useNavigate();
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isAddCatOpen, setIsAddCatOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
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
  const handleDeleteCategory = async (id: string) => {
    if (confirm('هل أنت متأكد م�� حذف هذا البند؟')) {
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
  return (
    <RtlWrapper>
      <header className="px-6 pt-8 pb-4">
        <h1 className="text-xl font-bold text-slate-900">الإعدادات</h1>
        <p className="text-sm text-slate-500">تخصيص التطبيق</p>
      </header>
      <div className="flex-1 overflow-y-auto px-6 pb-24 space-y-8">
        {/* Categories Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-slate-900 font-bold">
              <Tag className="w-5 h-5 text-emerald-600" />
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
                  <DialogTitle className="text-right">إضافة بند صرف جديد</DialogTitle>
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
                  <Button onClick={handleAddCategory} disabled={isLoading} className="w-full bg-emerald-600 hover:bg-emerald-700">
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
            <Wallet className="w-5 h-5 text-emerald-600" />
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
          <p className="text-xs text-slate-400 mt-2 mr-1">
            * إيقاف العُهدة يخفيها من الشاشة الرئيسية ولكنه لا يحذف بياناتها.
          </p>
        </section>
        {/* App Info & Logout */}
        <section className="pt-4 border-t border-slate-100">
          <div className="bg-slate-50 rounded-xl p-4 mb-4">
            <div className="flex items-center gap-2 text-slate-600 mb-2">
              <Info className="w-4 h-4" />
              <span className="text-sm font-bold">عن التطبيق</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              تطبيق مُحافظ هو نظام شخصي لإدارة العُهد وال��صروفات الميدانية.
              الإصدار: 1.0.0
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