import * as React from 'react';
export const Tabs=({children,defaultValue}:{children:React.ReactNode;defaultValue?:string})=><div data-default-value={defaultValue}>{children}</div>;
export const TabsList=({children}:{children:React.ReactNode})=><div className="mb-4 flex gap-2 rounded-md bg-muted p-1">{children}</div>;
export const TabsTrigger=({children,value}:{children:React.ReactNode;value:string})=><button type="button" data-value={value} className="rounded px-3 py-2 text-sm hover:bg-background">{children}</button>;
export const TabsContent=({children,value}:{children:React.ReactNode;value:string})=><div data-value={value}>{children}</div>;
