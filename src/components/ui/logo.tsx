import Image from 'next/image';
import Link from 'next/link';

interface LogoProps {
  href?: string;
  className?: string;
  imageClassName?: string;
  showText?: boolean;
}

export function Logo({ 
  href = '/dashboard', 
  className = '', 
  imageClassName = 'h-8 w-8',
  showText = true 
}: LogoProps) {
  const content = (
    <div className={`flex items-center gap-2 ${className}`}>
      <Image
        src="/logo.svg"
        alt="Network32 Logo"
        width={32}
        height={32}
        className={imageClassName}
        priority
      />
      {showText && (
        <span className="text-xl font-bold text-primary">Network32</span>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex">
        {content}
      </Link>
    );
  }

  return content;
}
