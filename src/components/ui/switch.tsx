import * as React from 'react';
import { cn } from '@/lib/utils';
export interface SwitchProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> { checked?: boolean; onCheckedChange?: (checked: boolean) => void; }
export const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(({ checked=false, onCheckedChange, className, ...props }, ref) => <button ref={ref} type="button" role="switch" aria-checked={checked} onClick={() => onCheckedChange?.(!checked)} className={cn('relative h-6 w-11 rounded-full bg-muted transition-colors', checked && 'bg-primary', className)} {...props}><span className={cn('absolute top-1 h-4 w-4 rounded-full bg-white transition-transform', checked ? 'right-1' : 'left-1')} /></button>);
Switch.displayName='Switch';
