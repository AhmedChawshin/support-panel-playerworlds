'use client';

import { Box, Spinner } from '@chakra-ui/react';
import LoginForm from '../components/LoginForm';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Home() {
  const router = useRouter();
  const [token, setToken] = useState(null); // Initialize as null
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Access localStorage after the component has mounted on the client
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('token');
      setToken(storedToken);
    }
    setIsLoading(false); // Stop loading after the check
  }, []);

  useEffect(() => {
    if (token) {
      // Redirect to dashboard if token exists
      setTimeout(() => router.push('/dashboard'), 100); // Delay for smooth transition
    }
  }, [token, router]);

  const handleLogin = (newToken) => {
    setToken(newToken);
    setIsLoading(true); // Show the spinner after login
  };

  if (isLoading) {
    // Show loading spinner until the client-side state is set
    return <Spinner size="xl" m="auto" display="block" mt="20vh" />;
  }

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minH="calc(100vh - 64px)"
      bg="gray.900"
      animation="fadeIn 0.3s ease-in"
    >
      <LoginForm onLogin={handleLogin} />
    </Box>
  );
}