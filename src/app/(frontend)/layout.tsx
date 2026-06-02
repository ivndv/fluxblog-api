import React from 'react'
import './styles.css'

export const metadata = {
  description: 'Fluxdev Blog Backend',
  title: 'Fluxdev Blog API',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <main>{children}</main>
      </body>
    </html>
  )
}
