export const metadata = {
  title: 'Weigh Station - Camel Caravan',
  description: 'Add/Edit/Delete/Print/Reload with search and alarms'
};

import './globals.css';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

