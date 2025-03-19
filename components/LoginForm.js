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
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isLoading, setIsLoading] = useState(false); // New loading state
  const toast = useToast();

  const handleEmailChange = (e) => {
    const value = e.target.value;
    const sanitizedValue = value.replace(/[^a-zA-Z0-9@.\-_+]/g, '');
    setEmail(sanitizedValue);
  };

  const isValidEmail = () => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

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
    
    setIsLoading(true); // Disable buttons
    try {
      await axios.post('/api/auth', { email });
      if (!isResend) {
        setStep('code');
      }
      setResendCooldown(60);
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
    } finally {
      setIsLoading(false); // Re-enable buttons
    }
  };

  const handleCodeSubmit = async () => {
    setIsLoading(true); // Disable buttons
    try {
      const { data } = await axios.post('/api/auth', { email, code });
      localStorage.setItem('token', data.token);
      window.dispatchEvent(new Event('token-updated'));
      onLogin(data.token);
    } catch (error) {
      toast({ title: 'Invalid code', status: 'error', position: 'top' });
    } finally {
      setIsLoading(false); // Re-enable buttons
    }
  };

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
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
              isDisabled={!isValidEmail() || isLoading} // Disable when loading
              isLoading={isLoading} // Show loading spinner
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
                isDisabled={!code.trim() || isLoading} // Disable when loading
                isLoading={isLoading} // Show loading spinner
              >
                Verify
              </Button>
              <Button
                variant="outline"
                size="md"
                colorScheme="teal"
                onClick={() => handleEmailSubmit(true)}
                isDisabled={resendCooldown > 0 || isLoading} // Disable when loading
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