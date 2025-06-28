import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Logic Tree Editor',
  description: 'Created by Jiraiyah',
  generator: 'dev.jiraiyah',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
