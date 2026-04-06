import { Link } from 'react-router-dom';
import logoWhite from '../assets/images/white-wrench-transparent.png';
import logoBlue from '../assets/images/blue-wrench-transparent.png';

function BrandMark({ to = '/', variant = 'dark', className = '' }) {
  if (variant === 'landingSplit') {
    return (
      <Link
        to={to}
        className={`flex min-w-0 items-center gap-2.5 sm:gap-3 text-[#1F4E79] lg:text-white ${className}`.trim()}
      >
        <img
          src={logoBlue}
          alt=""
          width={40}
          height={40}
          className="h-8 w-8 shrink-0 object-contain sm:h-9 sm:w-9 lg:hidden"
          decoding="async"
        />
        <img
          src={logoWhite}
          alt=""
          width={40}
          height={40}
          className="hidden h-8 w-8 shrink-0 object-contain sm:h-9 sm:w-9 lg:block"
          decoding="async"
        />
        <span className="truncate text-lg font-bold tracking-tight lg:drop-shadow-sm">
          Hire With Ease
        </span>
      </Link>
    );
  }

  const logo = variant === 'light' ? logoWhite : logoBlue;
  const textColor = variant === 'light' ? 'text-white' : 'text-[#1F4E79]';

  return (
    <Link
      to={to}
      className={`flex min-w-0 items-center gap-2.5 sm:gap-3 ${textColor} ${className}`.trim()}
    >
      <img
        src={logo}
        alt=""
        width={40}
        height={40}
        className="h-8 w-8 shrink-0 object-contain sm:h-9 sm:w-9"
        decoding="async"
      />
      <span
        className={`truncate text-lg font-bold tracking-tight ${variant === 'light' ? 'drop-shadow-sm' : ''}`.trim()}
      >
        Hire With Ease
      </span>
    </Link>
  );
}

export default BrandMark;
