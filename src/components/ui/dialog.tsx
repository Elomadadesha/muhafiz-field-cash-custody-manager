import * as React from 'react';
import { cn } from '@/lib/utils';
const Ctx = React.createContext<{open:boolean; setOpen:(v:boolean)=>void}>({open:false,setOpen:()=>{}});
export function Dialog({ open: controlled, onOpenChange, children }: { open?: boolean; onOpenChange?: (v:boolean)=>void; children: React.ReactNode }) { const [local,setLocal]=React.useState(false); const open=controlled ?? local; const setOpen=(v:boolean)=>{setLocal(v);onOpenChange?.(v)}; return <Ctx.Provider value={{open,setOpen}}>{children}</Ctx.Provider>; }
export function DialogTrigger({ children, asChild=false }: { children: React.ReactNode; asChild?: boolean }) { const {setOpen}=React.useContext(Ctx); if(asChild && React.isValidElement(children)) return React.cloneElement(children as React.ReactElement<any>, { onClick: (e:any)=>{children.props.onClick?.(e);setOpen(true);} }); return <button type="button" onClick={()=>setOpen(true)}>{children}</button>; }
export function DialogContent({ className, children }: { className?: string; children: React.ReactNode }) { const {open,setOpen}=React.useContext(Ctx); if(!open)return null; return <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onMouseDown={()=>setOpen(false)}><div className={cn('w-full max-w-lg rounded-xl bg-background p-6 shadow-xl',className)} onMouseDown={e=>e.stopPropagation()}>{children}</div></div>; }
export const DialogHeader=({children}:{children:React.ReactNode})=><div className="mb-4 space-y-1">{children}</div>;
export const DialogFooter=({children}:{children:React.ReactNode})=><div className="mt-5 flex justify-end gap-2">{children}</div>;
export const DialogTitle=({children}:{children:React.ReactNode})=><h2 className="text-lg font-bold">{children}</h2>;
export const DialogDescription=({children}:{children:React.ReactNode})=><p className="text-sm text-muted-foreground">{children}</p>;
