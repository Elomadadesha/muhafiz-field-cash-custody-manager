import * as React from 'react';
export function Calendar({ selected, onSelect }: { selected?: Date; onSelect?: (date?: Date)=>void }) { const value=selected ? new Date(selected).toISOString().slice(0,10) : ''; return <input type="date" value={value} onChange={e=>onSelect?.(e.target.value ? new Date(`${e.target.value}T12:00:00`) : undefined)} className="rounded-md border bg-background p-2" />; }
