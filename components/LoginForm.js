'use client';

import { useState } from 'react';
import {
  VStack,
  Heading,
  Input,
  Button,
  Text,
  useToast,
  Box,
  Center,
} from '@chakra-ui/react';
import axios from 'axios';

export default function LoginForm({ onLogin }) {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState('email');
  const toast = useToast();

  // Restrict email input to valid characters and no spaces
  const handleEmailChange = (e) => {
    const value = e.target.value;
    // Allow only letters, numbers, @, ., -, _, and +
    const sanitizedValue = value.replace(/[^a-zA-Z0-9@.\-_+]/g, '');
    setEmail(sanitizedValue);
  };

  // Validate email format
  const isValidEmail = () => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const handleEmailSubmit = async () => {
    if (!isValidEmail()) {
      toast({
        title: 'Invalid email',
        description: 'Please enter a valid email address',
        status: 'error',
        position: 'top',
      });
      return;
    }
    try {
      await axios.post('/api/auth', { email });
      setStep('code');
      toast({ title: 'Code sent', status: 'success', position: 'top' });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || error.message,
        status: 'error',
        position: 'top',
      });
    }
  };

  const handleCodeSubmit = async () => {
    try {
      const { data } = await axios.post('/api/auth', { email, code });
      localStorage.setItem('token', data.token);
      window.dispatchEvent(new Event('token-updated'));
      onLogin(data.token);
    } catch (error) {
      toast({ title: 'Invalid code', status: 'error', position: 'top' });
    }
  };

  return (
    <Center minH="calc(100vh - 72px)" px={4}>
      <Box
        as="form"
        w="full"
        maxW="sm"
        bg="gray.800"
        borderRadius="lg"
        boxShadow="lg"
        p={6}
        border="1px"
        borderColor="gray.700"
        onSubmit={(e) => {
          e.preventDefault();
          step === 'email' ? handleEmailSubmit() : handleCodeSubmit();
        }}
      >
        <VStack spacing={6}>
          <Heading size="lg" textAlign="center" color="gray.50">
            Sign In
          </Heading>
          {step === 'email' ? (
            <>
              <Input
                placeholder="Email address"
                value={email}
                onChange={handleEmailChange}
                size="md"
                focusBorderColor="teal.400"
                autoComplete="email"
                pattern="[a-zA-Z0-9@.\-_+]+" // HTML5 pattern for extra layer
                title="Only letters, numbers, @, ., -, _, and + are allowed"
              />
              <Button
                colorScheme="teal"
                size="md"
                w="full"
                type="submit"
                isDisabled={!isValidEmail()}
              >
                Send Code
              </Button>
            </>
          ) : (
            <>
              <Text fontSize="sm" color="gray.400" textAlign="center">
                Enter the code sent to {email}
              </Text>
              <Input
                placeholder="Verification code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                size="md"
                focusBorderColor="teal.400"
                autoComplete="off"
              />
              <Button
                colorScheme="teal"
                size="md"
                w="full"
                type="submit"
                isDisabled={!code.trim()}
              >
                Verify
              </Button>
            </>
          )}
        </VStack>
      </Box>
    </Center>
  );
}