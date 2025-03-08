'use client';

import { Box, VStack, Heading, Button, StackDivider } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function Dashboard() {
  const [token, setToken] = useState(null);
  const router = useRouter();

  // Fetch token only on the client side
  useEffect(() => {
    const storedToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    setToken(storedToken);
  }, []);

  // Redirect if token is not available
  useEffect(() => {
    if (!token) router.push('/');
  }, [token, router]);

  if (!token) return null; // Prevent rendering until the token is set

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
