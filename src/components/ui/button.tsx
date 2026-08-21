import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> { variant?: 'default'|'outline'|'ghost'|'destructive'; size?: 'default'|'sm'|'lg'|'icon'; }
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant='default', size='default', type='button', ...props }, ref) => (
  <button ref={ref} type={type} className={cn('inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none disabled:pointer-events-none disabled:opacity-50', variant==='default' && 'bg-primary text-primary-foreground hover:opacity-90', variant==='outline' && 'border border-input bg-background hover:bg-accent', variant==='ghost' && 'hover:bg-accent', variant==='destructive' && 'bg-destructive text-destructive-foreground', size==='sm' && 'h-9 px-3 text-sm', size==='lg' && 'h-11 px-8', size==='icon' && 'h-10 w-10', size==='default' && 'h-10 px-4', className)} {...props} />
));
Button.displayName='Button';
