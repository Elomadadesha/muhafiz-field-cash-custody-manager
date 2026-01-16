import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowLeft, Lock, KeyRound } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { RtlWrapper } from '@/components/ui/rtl-wrapper';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
export function LoginPage() {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const login = useAppStore(s => s.login);
  const setupApp = useAppStore(s => s.setupApp);
  const isSetup = useAppStore(s => s.isSetup);
  const isLocked = useAppStore(s => s.isLocked);
  const init = useAppStore(s => s.init);
  const navigate = useNavigate();
  useEffect(() => {
    init();
  }, [init]);
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin) return;
    setIsLoading(true);
    try {
      const success = await login(pin);
      if (success) {
        toast.success('تم تسجيل الدخول بنجاح');
        navigate('/dashboard');
      } else {
        toast.error('كلمة الم��ور غير صحيحة');
        setPin('');
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء تسجيل الدخول');
    } finally {
      setIsLoading(false);
    }
  };
  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length < 4) {
      toast.error('كلمة المرور يجب أن تكون 4 أرقام على الأقل');
      return;
    }
    if (pin !== confirmPin) {
      toast.error('كلمات المرور غير متطابقة');
      return;
    }
    setIsLoading(true);
    try {
      await setupApp(pin);
      toast.success('تم إعداد التطبيق بنجاح');
      navigate('/dashboard');
    } catch (error) {
      toast.error('فشل إعداد التطبيق');
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <RtlWrapper className="justify-center items-center p-8 bg-slate-50">
      <div className="w-full max-w-xs space-y-8">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-blue-600 text-white shadow-xl shadow-blue-600/20 mb-4">
            {isSetup ? <Lock className="w-10 h-10" /> : <ShieldCheck className="w-10 h-10" />}
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Abu MaWaDa</h1>
          <p className="text-slate-500">
            {isSetup
              ? (isLocked ? 'التطبيق مق��ل' : 'تسجيل الدخول')
              : 'إعداد كلمة المرور الجديد��'}
          </p>
        </div>
        {isSetup ? (
          // Login Form
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
                className="text-center text-2xl tracking-widest h-14 rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
                autoFocus
              />
            </div>
            <Button
              type="submit"
              className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-600/20 transition-all active:scale-95"
              disabled={isLoading || !pin}
            >
              {isLoading ? 'جاري التحقق...' : (isLocked ? 'فتح القفل' : 'دخول')}
              <ArrowLeft className="w-5 h-5 mr-2" />
            </Button>
          </form>
        ) : (
          // Setup Form
          <form onSubmit={handleSetup} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 block text-right">
                  كلمة المرور الجديدة
                </label>
                <Input
                  type="password"
                  inputMode="numeric"
                  placeholder="••••••"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="text-center text-2xl tracking-widest h-14 rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 block text-right">
                  تأكيد كلمة المرور
                </label>
                <Input
                  type="password"
                  inputMode="numeric"
                  placeholder="••••••"
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value)}
                  className="text-center text-2xl tracking-widest h-14 rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
                />
              </div>
            </div>
            <Button
              type="submit"
              className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-600/20 transition-all active:scale-95"
              disabled={isLoading || !pin || !confirmPin}
            >
              {isLoading ? 'جاري الحفظ...' : 'بدء ال��ستخدام'}
              <KeyRound className="w-5 h-5 mr-2" />
            </Button>
          </form>
        )}
        <p className="text-center text-xs text-slate-400 mt-8">
          نسخة محلية آمن�� v2.0.0
        </p>
      </div>
    </RtlWrapper>
  );
}