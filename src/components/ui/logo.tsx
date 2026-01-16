import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Coins } from 'lucide-react';
interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}
export function Logo({ className, size = 'md' }: LogoProps) {
  const [error, setError] = useState(false);
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-24 h-24',
    xl: 'w-32 h-32',
  };
  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };
  if (error) {
    return (
      <div 
        className={cn(
          "relative flex items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600 shadow-md text-white",
          sizeClasses[size],
          className
        )}
      >
        <Coins className={cn("opacity-90", iconSizes[size])} />
        <span className="sr-only">Abu MaWaDa</span>
      </div>
    );
  }
  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      <img
        src="/logo.png"
        alt="Abu MaWaDa Logo"
        className={cn("object-contain drop-shadow-md", sizeClasses[size])}
        onError={() => setError(true)}
      />
    </div>
  );
}