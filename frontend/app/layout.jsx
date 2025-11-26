"use client"

import { ApolloProvider } from '@apollo/client'
import { ThemeProvider } from 'next-themes'
import client from '../lib/apollo-client'
import './globals.css'

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>DevThreads - Developer Community Platform</title>
        <meta name="description" content="A developer-first community platform for microblogs and coding reels" />
      </head>
      <body>
        <ApolloProvider client={client}>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
            {children}
          </ThemeProvider>
        </ApolloProvider>
      </body>
    </html>
  )
}
