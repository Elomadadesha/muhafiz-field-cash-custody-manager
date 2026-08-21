import * as React from 'react';
export const Popover=({children}:{children:React.ReactNode})=><div className="relative">{children}</div>;
export const PopoverTrigger=({children,asChild=false}:{children:React.ReactNode;asChild?:boolean})=>asChild?children:<button type="button">{children}</button>;
export const PopoverContent=({children,className}:{children:React.ReactNode;className?:string})=><div className={`absolute z-50 mt-1 rounded-md border bg-background p-3 shadow-lg ${className||''}`}>{children}</div>;
