'use client';

import { Box, VStack, Heading, Button, StackDivider } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function Dashboard() {
  const [token, setToken] = useState(null);
  const [isTokenChecked, setIsTokenChecked] = useState(false); // Track if token has been checked
  const router = useRouter();

  // Fetch token only on the client side
  useEffect(() => {
    const storedToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    setToken(storedToken);
    setIsTokenChecked(true); // Mark token check as complete
  }, []);

  // Redirect if token is not available
  useEffect(() => {
    if (isTokenChecked && !token) {
      router.push('/');
    }
  }, [isTokenChecked, token, router]);

  // Prevent rendering until the token is checked
  if (!isTokenChecked) {
    return null;
  }

  return (
    <Box p={10} minH="calc(100vh - 72px)">
      <Heading size="xl" mb={10} textAlign="center">
        Dashboard
      </Heading>
      <VStack
        spacing={4}
        maxW="400px"
        mx="auto"
        align="stretch"
        divider={<StackDivider borderColor="gray.700" />}
      >
        <Button size="lg" variant="ghost" w="full" onClick={() => router.push('/dashboard/tickets')}>
          View Tickets
        </Button>
        <Button size="lg" colorScheme="teal" w="full" onClick={() => router.push('/dashboard/new')}>
          Create Ticket
        </Button>
      </VStack>
    </Box>
  );
}