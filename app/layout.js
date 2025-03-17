"use client"
import { ChakraProvider } from '@chakra-ui/react';
import theme from '../styles/theme';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>GraalOnline Playerworlds Support</title>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/favicon.ico" />
        <meta name="description" content="GraalOnline Playerworlds Support page" />
        <meta name="og:title" content="GraalOnline Playerworlds Support" />
        <meta name="og:description" content="A support page for GraalOnline Playerworlds Support" />
        <meta name="og:image" content="/GraalChristmas.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="GraalOnline Playerworlds Support" />
      </head>
      <body>
        <ChakraProvider theme={theme}>
          <NavBar />
          <main style={{ minHeight: 'calc(100vh - 72px)'}}>{children}</main>
          <Footer />
        </ChakraProvider>
      </body>
    </html>
  );
}