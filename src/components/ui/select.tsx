import * as React from 'react';
import { cn } from '@/lib/utils';
const Ctx = React.createContext<{value?: string; onValueChange?: (v:string)=>void}>({});
export function Select({ value, defaultValue, onValueChange, children }: { value?: string; defaultValue?: string; onValueChange?: (v:string)=>void; children: React.ReactNode }) { return <Ctx.Provider value={{ value: value ?? defaultValue, onValueChange }}>{children}</Ctx.Provider>; }
export function SelectTrigger({ className, children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) { return <button type="button" className={cn('flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 text-sm', className)} {...props}>{children}<span>⌄</span></button>; }
export function SelectValue({ placeholder }: { placeholder?: string }) { const { value } = React.useContext(Ctx); return <span>{value || placeholder}</span>; }
export function SelectContent({ children }: { children: React.ReactNode }) { return <div className="z-50 mt-1 rounded-md border bg-background p-1 shadow-md">{children}</div>; }
export function SelectItem({ value, children }: { value: string; children: React.ReactNode }) { const ctx = React.useContext(Ctx); return <button type="button" className="block w-full rounded px-3 py-2 text-right text-sm hover:bg-accent" onClick={() => ctx.onValueChange?.(value)}>{children}</button>; }
