import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowLeft } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { RtlWrapper } from '@/components/ui/rtl-wrapper';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
export function LoginPage() {
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const login = useAppStore(s => s.login);
  const navigate = useNavigate();
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin) return;
    setIsLoading(true);
    try {
      const success = await login(pin);
      if (success) {
        toast.success('تم ��سجيل الدخول بنجاح');
        navigate('/dashboard');
      } else {
        toast.error('كلم�� المرور غير صحيحة');
        setPin('');
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء تسجيل الدخول');
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <RtlWrapper className="justify-center items-center p-8 bg-slate-50">
      <div className="w-full max-w-xs space-y-8">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-emerald-600 text-white shadow-xl shadow-emerald-600/20 mb-4">
            <ShieldCheck className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">مُحافظ</h1>
          <p className="text-slate-500">نظام إدارة العُهد والمصروفات</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 block text-right">
              كلمة المرور
            </label>
            <Input
              type="password"
              inputMode="numeric"
              placeholder="••••••"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="text-center text-2xl tracking-widest h-14 rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20"
              maxLength={6}
              autoFocus
            />
          </div>
          <Button 
            type="submit" 
            className="w-full h-12 text-lg bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-lg shadow-emerald-600/20 transition-all active:scale-95"
            disabled={isLoading || pin.length < 3}
          >
            {isLoading ? 'جاري الت��قق...' : 'دخول'}
            <ArrowLeft className="w-5 h-5 mr-2" />
          </Button>
        </form>
        <p className="text-center text-xs text-slate-400 mt-8">
          نسخة تجريبية v1.0.0
        </p>
      </div>
    </RtlWrapper>
  );
}