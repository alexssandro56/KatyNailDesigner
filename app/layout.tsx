import type { Metadata } from "next"
import type React from "react" // Import React

export const metadata: Metadata = {
  title: "Katy Silva Nail Designer",
  description: "Agendamento de serviços",
  icons: {
    icon: "/favicon.ico",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}



import './globals.css'