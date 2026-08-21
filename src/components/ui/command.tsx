import * as React from 'react';
export const Command=({children,className}:{children:React.ReactNode;className?:string})=><div className={`rounded-md border bg-background p-2 ${className||''}`}>{children}</div>;
export const CommandDialog=({open,onOpenChange,children}:{open?:boolean;onOpenChange?:(v:boolean)=>void;children:React.ReactNode})=>open ? <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={()=>onOpenChange?.(false)}><div className="w-full max-w-lg" onClick={e=>e.stopPropagation()}>{children}</div></div> : null;
export const CommandInput=React.forwardRef<HTMLInputElement,React.InputHTMLAttributes<HTMLInputElement>>((props,ref)=><input ref={ref} className="mb-2 h-10 w-full border-b bg-transparent px-2 outline-none" {...props}/>);
CommandInput.displayName='CommandInput';
export const CommandList=({children}:{children:React.ReactNode})=><div className="max-h-72 overflow-y-auto">{children}</div>;
export const CommandEmpty=({children}:{children:React.ReactNode})=><div className="p-4 text-center text-sm text-muted-foreground">{children}</div>;
export const CommandGroup=({children,heading}:{children:React.ReactNode;heading?:React.ReactNode})=><div className="mb-2"><div className="px-2 py-1 text-xs text-muted-foreground">{heading}</div>{children}</div>;
export const CommandItem=({children,onSelect}:{children:React.ReactNode;onSelect?:()=>void})=><button type="button" onClick={onSelect} className="block w-full rounded px-2 py-2 text-right hover:bg-accent">{children}</button>;
