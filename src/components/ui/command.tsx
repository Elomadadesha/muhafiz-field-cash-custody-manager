import React from 'react';

export const Command = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={`rounded-2xl border border-white/10 bg-[#18243a] p-2 text-slate-100 ${className || ''}`}>{children}</div>
);

export const CommandDialog = ({ open, onOpenChange, children }: { open?: boolean; onOpenChange?: (v: boolean) => void; children: React.ReactNode }) => open ? (
  <div className="fixed inset-0 z-[70] flex items-start justify-center bg-[#020817]/80 px-4 pb-8 pt-[max(5rem,env(safe-area-inset-top))] backdrop-blur-sm" onClick={() => onOpenChange?.(false)}>
    <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-[#101a2e] shadow-2xl shadow-black/40" dir="rtl" onClick={e => e.stopPropagation()}>
      {children}
    </div>
  </div>
) : null;

export const CommandInput = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>((props, ref) => (
  <div className="border-b border-white/10 px-4 py-3">
    <input ref={ref} className="h-12 w-full rounded-2xl border border-white/10 bg-[#1b2940] px-4 text-right text-sm text-white outline-none placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" {...props} />
  </div>
));
CommandInput.displayName = 'CommandInput';

export const CommandList = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={`max-h-[60vh] overflow-y-auto p-2 ${className || ''}`}>{children}</div>
);
export const CommandEmpty = ({ children }: { children: React.ReactNode }) => <div className="p-8 text-center text-sm text-slate-400">{children}</div>;
export const CommandGroup = ({ children, heading }: { children: React.ReactNode; heading?: React.ReactNode }) => <div className="mb-2"><div className="px-3 py-2 text-xs font-bold text-slate-400">{heading}</div>{children}</div>;
export const CommandItem = ({ children, onSelect, className }: { children: React.ReactNode; onSelect?: () => void; className?: string }) => (
  <button type="button" onClick={onSelect} className={`block w-full rounded-2xl px-3 py-3 text-right transition-colors hover:bg-white/5 ${className || ''}`}>{children}</button>
);
