import Link from 'next/link';
import styles from './Header.module.css';

export default function Header() {
  return (
    <header className={styles.header}>
      <Link href="/">
        <h1 className={styles.logo}>NusaRasa</h1>
      </Link>
    </header>
  );
}
