'use client';

import { Box, Spinner, VStack, Text, Heading } from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import LoginForm from '../components/LoginForm';

// Fade-in animation
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const LoadingSpinner = () => (
  <Box
    bg="gray.900"
    h="100vh"
    display="flex"
    alignItems="center"
    justifyContent="center"
  >
    <Spinner size="xl" color="teal.400" thickness="4px" speed="0.65s" />
  </Box>
);

export default function Home() {
  const router = useRouter();
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('token');
      setToken(storedToken);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) {
      setTimeout(() => router.push('/dashboard'), 200);
    }
  }, [token, router]);

  const handleLogin = (newToken) => {
    setToken(newToken);
    setIsLoading(true);
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <Box position="relative" h="100vh" overflow="hidden" bg="gray.900">
      {/* Background Image */}
      <Image
        src="/images/background_graalwebsite.jpg"
        alt="Support Background"
        fill
        style={{ objectFit: 'cover', zIndex: 0 }}
        quality={85}
        priority
      />

      {/* Overlay */}
      <Box
        position="absolute"
        inset={0}
        bg="rgba(0, 0, 0, 0.75)" // Darker overlay for better contrast
        zIndex={1}
      />

      {/* Content */}
      <VStack
        position="relative"
        zIndex={2}
        h="100vh"
        spacing={6}
        align="center"
        justify="center"
        px={{ base: 4, md: 6 }}
        color="white"
      >
        {/* Logo */}
        <Box
          animation={`${fadeIn} 0.6s ease-out`}
          transition="transform 0.2s ease"
          _hover={{ transform: 'scale(1.03)' }}
        >
          <Image
            src="/images/logograalonline.png"
            draggable="false"
            alt="Graal Online Support"
            width={200}
            height={120}
            style={{ maxWidth: '100%', height: 'auto' }}
            quality={90}
            priority
            sizes="(max-width: 768px) 200px, 300px"
          />
        </Box>

        {/* Heading and Text */}
        <VStack spacing={3} textAlign="center" maxW="md">
          <Heading
            fontSize={{ base: '2xl', md: '3xl' }}
            fontWeight="bold"
            animation={`${fadeIn} 0.8s ease-out`}
          >
            GraalOnline Support
          </Heading>
          <Text
            fontSize={{ base: 'sm', md: 'md' }}
            color="gray.300"
            animation={`${fadeIn} 1s ease-out`}
          >
            Sign in with your GraalOnline email to access support or submit a ticket.
          </Text>
        </VStack>

        {/* Login Form Container */}
        <Box
          w={{ base: 'full', sm: 'sm', md: 'md' }}
          maxW="400px"
          p={{ base: 5, md: 6 }}
          bg="gray.800"
          borderRadius="lg"
          boxShadow="lg"
          border="1px solid"
          borderColor="gray.700"
          animation={`${fadeIn} 1.2s ease-out`}
          transition="all 0.2s ease"
          _hover={{ boxShadow: 'xl', borderColor: 'gray.600' }}
        >
          <LoginForm onLogin={handleLogin} />
        </Box>
      </VStack>
    </Box>
  );
}