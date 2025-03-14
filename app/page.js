'use client';

import { Box, Spinner, VStack, Heading, Text, Image } from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import LoginForm from '../components/LoginForm';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

// Enhanced fade-in animation with slight scale
const fadeIn = keyframes`
  from { opacity: 0; transform: scale(0.98); }
  to { opacity: 1; transform: scale(1); }
`;

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
      setTimeout(() => router.push('/dashboard'), 200); // Slightly longer delay for smoothness
    }
  }, [token, router]);

  const handleLogin = (newToken) => {
    setToken(newToken);
    setIsLoading(true); // Show the spinner after login
  };

  if (isLoading) {
    return (
      <Box bg="gray.900" minH="100vh" display="flex" alignItems="center" justifyContent="center">
        <Spinner size="xl" color="teal.400" thickness="4px" speed="0.65s" />
      </Box>
    );
  }

  return (
    <Box
      minH="100vh"
      bgImage="url('/images/background_graalwebsite.jpg')"
      bgSize="cover"
      bgPosition="center"
      bgRepeat="no-repeat"
      position="relative"
      overflow="hidden"
    >
      {/* Gradient Overlay for smoother transition */}
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        bg="linear-gradient(to bottom, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.5))"
        zIndex={1}
      />
      {/* Content */}
      <VStack
        spacing={{ base: 8, md: 12 }}
        align="center"
        justify="center"
        minH="100vh"
        px={{ base: 4, md: 8 }}
        py={{ base: 10, md: 16 }}
        position="relative"
        zIndex={2}
        color="white"
      >
        {/* Logo */}
        <Box
          animation={`${fadeIn} 0.8s ease-out`}
          transition="transform 0.2s ease"
          _hover={{ transform: 'scale(1.02)' }}
        >
          <Image
            src="/images/logograalonline.png"
            alt="Graal Online Logo"
            maxW={{ base: '220px', md: '320px' }}
            filter="drop-shadow(0 4px 12px rgba(0, 0, 0, 0.3))"
          />
        </Box>

        {/* Welcome Text */}
        <VStack
          spacing={4}
          textAlign="center"
          maxW="lg"
          animation={`${fadeIn} 1s ease-out`}
        >
          <Text
            fontSize={{ base: 'md', md: 'lg' }}
            color="gray.200"
            fontWeight="medium"
          >
            Sign in with your GraalOnline e-mail address to open a support ticket
          </Text>
        </VStack>

        {/* Login Form */}
        <Box
          w={{ base: 'full', md: 'md' }}
          maxW="sm"
          p={6}
          bg="gray.800"
          borderRadius="xl"
          boxShadow="2xl"
          border="1px solid"
          borderColor="gray.700"
          animation={`${fadeIn} 1.2s ease-out`}
          transition="all 0.3s ease"
        >
          <LoginForm onLogin={handleLogin} />
        </Box>
      </VStack>
    </Box>
  );
}