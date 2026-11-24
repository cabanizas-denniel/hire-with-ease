import { Link } from 'react-router-dom';
import logoWhite from '../assets/images/white-wrench-transparent.png';
import logoBlue from '../assets/images/blue-wrench-transparent.png';

function BrandMark({ to = '/', variant = 'dark', className = '' }) {
  if (variant === 'landingSplit') {
    return (
      <Link
        to={to}
        className={`flex min-w-0 items-center gap-2.5 text-[var(--hwe-slate)] sm:gap-3 lg:text-white ${className}`.trim()}
      >
        <img
          src={logoWhite}
          alt=""
          width={40}
          height={40}
          className="h-8 w-8 shrink-0 object-contain sm:h-9 sm:w-9"
          decoding="async"
        />
        <span className="truncate text-lg font-bold tracking-tight">Hire With Ease</span>
      </Link>
    );
  }

  // onStrong: white wrench on blue bands (slate label). blueOnDark: blue wrench on slate panels.
  const logo =
    variant === 'light' || variant === 'onStrong' ? logoWhite : logoBlue;
  const textColor =
    variant === 'light' || variant === 'blueOnDark'
      ? 'text-white'
      : 'text-[var(--hwe-slate)]';

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
      <span className="truncate text-lg font-bold tracking-tight">Hire With Ease</span>
    </Link>
  );
}

export default BrandMark;
