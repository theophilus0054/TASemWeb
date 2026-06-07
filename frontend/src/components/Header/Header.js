import Link from 'next/link';

/**
 * Header — compact top navigation bar.
 * Uses vanilla CSS classes defined in globals.css.
 */
export default function Header() {
  return (
    <header className="site-header">
      <Link href="/">
        <span className="text-gradient site-header__logo">
          NusaRasa
        </span>
      </Link>
      <nav className="site-header__nav">
        <Link href="/" className="site-header__link">
          Beranda
        </Link>
        <Link href="/food" className="site-header__link">
          Jelajahi
        </Link>
      </nav>
    </header>
  );
}
