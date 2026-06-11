import './globals.css';

export const metadata = {
  title: 'NusaRasa — Kuliner Nusantara',
  description: 'Jelajahi hidangan khas Nusantara dengan teknologi Semantic Web. Cari makanan berdasarkan daerah, bahan, dan budaya.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>
        {children}
      </body>
    </html>
  );
}
