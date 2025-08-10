import './globals.css';
export const metadata = { title: 'Neon Souls' };
export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body className="bg-bg text-white overflow-hidden">{children}</body>
    </html>
  );
}
