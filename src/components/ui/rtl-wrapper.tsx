import React from 'react';
import { cn } from '@/lib/utils';
interface RtlWrapperProps {
  children: React.ReactNode;
  className?: string;
}
export function RtlWrapper({ children, className }: RtlWrapperProps) {
  return (
    <div className="min-h-screen bg-[#070d1d] font-sans" dir="rtl">
      <div className={cn("max-w-md mx-auto min-h-screen bg-[#0d162b] shadow-2xl overflow-hidden relative flex flex-col", className)}>
        {children}
      </div>
    </div>
  );
}