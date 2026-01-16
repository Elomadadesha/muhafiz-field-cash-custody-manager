import { cn } from '@/lib/utils';
interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}
export function Logo({ className, size = 'md' }: LogoProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-24 h-24',
    xl: 'w-32 h-32',
  };
  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      <img
        src="/logo.png"
        alt="Abu MaWaDa Logo"
        className={cn("object-contain drop-shadow-md", sizeClasses[size])}
        onError={(e) => {
          // Fallback if image is missing
          e.currentTarget.style.display = 'none';
          e.currentTarget.parentElement?.classList.add('bg-gradient-to-br', 'from-amber-400', 'to-amber-600', 'rounded-full');
        }}
      />
      {/* Fallback text if image fails to load (handled by CSS/JS logic above mostly, but structure remains) */}
      <span className="sr-only">Abu MaWaDa</span>
    </div>
  );
}