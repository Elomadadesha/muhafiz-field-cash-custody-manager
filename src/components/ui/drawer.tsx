import * as React from 'react';
import { cn } from '@/lib/utils';
const Ctx=React.createContext<{open:boolean;setOpen:(v:boolean)=>void}>({open:false,setOpen:()=>{}});
export function Drawer({open=false,onOpenChange,children}:{open?:boolean;onOpenChange?: (v:boolean)=>void;children:React.ReactNode}){return <Ctx.Provider value={{open,setOpen:(v)=>onOpenChange?.(v)}}>{children}</Ctx.Provider>}
export const DrawerContent=({className,children}:{className?:string;children:React.ReactNode})=>{const {open}=React.useContext(Ctx);if(!open)return null;return <div className="fixed inset-0 z-50 bg-black/40"><div className={cn('absolute inset-x-0 bottom-0 max-h-[90vh] overflow-y-auto rounded-t-2xl bg-background p-5',className)}>{children}</div></div>};
export const DrawerHeader=({children}:{children:React.ReactNode})=><div className="mb-4">{children}</div>;
export const DrawerFooter=({children}:{children:React.ReactNode})=><div className="mt-5 flex gap-2">{children}</div>;
export const DrawerTitle=({children}:{children:React.ReactNode})=><h2 className="text-lg font-bold">{children}</h2>;
export const DrawerDescription=({children}:{children:React.ReactNode})=><p className="text-sm text-muted-foreground">{children}</p>;
