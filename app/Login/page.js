'use client';

import { useState, useEffect } from 'react';
import { Box, Button, Input, VStack } from '@chakra-ui/react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post('/api/auth/login', { email, password });
      if (res.data.token) {
        // Store token in localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', res.data.token);
        }

        // Redirect to tickets page
        router.push('/tickets');
      }
    } catch (error) {
      // Handle error if the login fails
      console.error('Login failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box p={10}>
      <VStack spacing={4}>
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button onClick={handleSubmit} isLoading={loading} loadingText="Logging in">
          Login
        </Button>
      </VStack>
    </Box>
  );
}
