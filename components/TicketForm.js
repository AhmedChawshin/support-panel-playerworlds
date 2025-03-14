'use client';

import { useState } from 'react';
import {
  VStack,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  Button,
  useToast,
  Box,
} from '@chakra-ui/react';
import axios from 'axios';

export default function TicketForm({ userEmail }) {
  const [graalid, setGraalid] = useState('');
  const [type, setType] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const handleSubmit = async () => {
    if (!graalid || !type || !title || !description) {
      toast({ title: 'All fields are required', status: 'warning' });
      return;
    }
    setIsSubmitting(true);
    try {
      await axios.post('/api/tickets', { email: userEmail, graalid, type, title, description });
      toast({ title: 'Ticket created!', status: 'success' });
      setGraalid('');
      setType('');
      setTitle('');
      setDescription('');
    } catch (error) {
      toast({ title: 'Error', description: error.response?.data?.message || error.message, status: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      maxW="600px"
      mx="auto"
      p={6}
      bg="gray.800"
      borderRadius="lg"
      boxShadow="lg"
      border="1px solid"
      borderColor="gray.700"
    >
      <VStack spacing={5} align="stretch">
        <FormControl isRequired>
          <FormLabel color="gray.300" fontWeight="semibold">
            GraalID
          </FormLabel>
          <Input
            placeholder="Enter your GraalID"
            value={graalid}
            onChange={(e) => setGraalid(e.target.value)}
            bg="gray.700"
            borderColor="gray.600"
            _hover={{ borderColor: 'gray.500' }}
            _focus={{ borderColor: 'teal.400', boxShadow: '0 0 0 1px teal.400' }}
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel color="gray.300" fontWeight="semibold">
            Type of Case
          </FormLabel>
          <Select
            placeholder="Select type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            bg="gray.700"
            borderColor="gray.600"
            _hover={{ borderColor: 'gray.500' }}
            _focus={{ borderColor: 'teal.400', boxShadow: '0 0 0 1px teal.400' }}
          >
            <option value="bug">Bug</option>
            <option value="feature">Feature Request</option>
            <option value="support">Support</option>
          </Select>
        </FormControl>

        <FormControl isRequired>
          <FormLabel color="gray.300" fontWeight="semibold">
            Title
          </FormLabel>
          <Input
            placeholder="Enter a title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            bg="gray.700"
            borderColor="gray.600"
            _hover={{ borderColor: 'gray.500' }}
            _focus={{ borderColor: 'teal.400', boxShadow: '0 0 0 1px teal.400' }}
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel color="gray.300" fontWeight="semibold">
            Description
          </FormLabel>
          <Textarea
            placeholder="Describe your issue or request"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            bg="gray.700"
            borderColor="gray.600"
            _hover={{ borderColor: 'gray.500' }}
            _focus={{ borderColor: 'teal.400', boxShadow: '0 0 0 1px teal.400' }}
            rows={5}
          />
        </FormControl>

        <Button
          colorScheme="teal"
          size="lg"
          onClick={handleSubmit}
          isLoading={isSubmitting}
          bg="teal.500"
          _hover={{ bg: 'teal.600' }}
          w="full"
        >
          Submit Ticket
        </Button>
      </VStack>
    </Box>
  );
}