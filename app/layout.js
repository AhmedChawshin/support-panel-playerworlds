"use client"
import { ChakraProvider } from '@chakra-ui/react';
import theme from '../styles/theme';
import NavBar from '../components/NavBar';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body>
        <ChakraProvider theme={theme}>
          <NavBar />
          <main style={{ minHeight: 'calc(100vh - 72px)', bg: 'gray.900' }}>{children}</main>
        </ChakraProvider>
      </body>
    </html>
  );
}