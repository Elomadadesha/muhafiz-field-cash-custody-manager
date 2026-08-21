import * as React from 'react';
export const DropdownMenu=({children}:{children:React.ReactNode})=><div className="relative inline-block">{children}</div>;
export const DropdownMenuTrigger=({children,asChild=false}:{children:React.ReactNode;asChild?:boolean})=>asChild?children:<button type="button">{children}</button>;
export const DropdownMenuContent=({children}:{children:React.ReactNode})=><div className="absolute left-0 z-50 mt-1 min-w-40 rounded-md border bg-background p-1 shadow-lg">{children}</div>;
export const DropdownMenuItem=({children,onClick}:{children:React.ReactNode;onClick?:()=>void})=><button type="button" onClick={onClick} className="block w-full rounded px-3 py-2 text-right text-sm hover:bg-accent">{children}</button>;

export const DropdownMenuSeparator=()=> <div className="my-1 h-px bg-border" />;
