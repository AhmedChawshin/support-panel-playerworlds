'use client';

import { useState, useEffect } from 'react';
import {
  VStack,
  Heading,
  Input,
  Button,
  Text,
  useToast,
  Box,
  HStack,
} from '@chakra-ui/react';
import axios from 'axios';

export default function LoginForm({ onLogin }) {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState('email');
  const [resendCooldown, setResendCooldown] = useState(0); // Cooldown in seconds
  const toast = useToast();

  // Restrict email input to valid characters and no spaces
  const handleEmailChange = (e) => {
    const value = e.target.value;
    const sanitizedValue = value.replace(/[^a-zA-Z0-9@.\-_+]/g, '');
    setEmail(sanitizedValue);
  };

  // Validate email format
  const isValidEmail = () => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  // Handle sending the initial email or resending
  const handleEmailSubmit = async (isResend = false) => {
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
      if (!isResend) {
        setStep('code'); // Only change step on initial send
      }
      setResendCooldown(60); // Start 60-second cooldown
      toast({
        title: isResend ? 'Code resent' : 'Code sent',
        status: 'success',
        position: 'top',
      });
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

  // Cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer); // Cleanup on unmount or when cooldown changes
    }
  }, [resendCooldown]);

  return (
    <Box
      as="form"
      w="full"
      bg="gray.800"
      borderRadius="lg"
      p={6}
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
              bg="gray.700"
              color="white"
              _placeholder={{ color: 'gray.400' }}
              autoComplete="email"
              pattern="[a-zA-Z0-9@.\-_+]+"
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
              bg="gray.700"
              color="white"
              _placeholder={{ color: 'gray.400' }}
              autoComplete="off"
            />
            <HStack w="full" justify="space-between">
              <Button
                colorScheme="teal"
                size="md"
                w="full"
                type="submit"
                isDisabled={!code.trim()}
              >
                Verify
              </Button>
              <Button
                variant="outline"
                size="md"
                colorScheme="teal"
                onClick={() => handleEmailSubmit(true)} // Resend flag
                isDisabled={resendCooldown > 0}
                w="full"
              >
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
              </Button>
            </HStack>
          </>
        )}
      </VStack>
    </Box>
  );
}