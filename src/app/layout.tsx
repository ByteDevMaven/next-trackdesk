import type React from "react"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { NextIntlClientProvider } from 'next-intl';
import { getLocale } from 'next-intl/server';
import { Providers } from '@/components/providers';
import { getUser, fetchSettings } from '@/lib/server-api';
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "TrackDesk",
  description: "Track and manage your business operations",
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const locale = await getLocale();
  let initialSettings = null;
  let userAlias = '';

  try {
    const user = await getUser();
    if (user) {
      userAlias = user.alias;
      initialSettings = await fetchSettings(user.alias);
    }
  } catch (error) {
    console.error('Error fetching initial settings:', error);
  }


  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <NextIntlClientProvider>
            <Providers userAlias={userAlias} initialSettings={initialSettings}>
              {children}
            </Providers>
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}