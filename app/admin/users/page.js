'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  Heading,
  Input,
  Button,
  useToast,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Text,
  Td,
  Select,
  Flex,
  IconButton,
  Spinner,
} from '@chakra-ui/react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { ArrowBackIcon } from '@chakra-ui/icons';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [searchEmail, setSearchEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = token ? require('jsonwebtoken').decode(token) : null;
    if (!user || user.role !== 'superadmin') {
      toast({
        title: 'Access Denied',
        description: 'Only superadmins can view this page.',
        status: 'error',
        position: 'top',
      });
      router.push('/');
    }
  }, [router, toast]);

  const fetchUser = async () => {
    if (!searchEmail.trim()) {
      toast({ title: 'Enter an email to search', status: 'warning', position: 'top' });
      return;
    }
    setLoading(true);
    try {
      const { data } = await axios.get(`/api/users?email=${searchEmail}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setUsers(data.users || [data.user].filter(Boolean)); // Handle single user or array
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'User not found',
        status: 'error',
        position: 'top',
      });
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (email, newRole) => {
    try {
      await axios.put('/api/users', { email, role: newRole }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      toast({ title: 'Role updated', status: 'success', position: 'top' });
      fetchUser();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || error.message,
        status: 'error',
        position: 'top',
      });
    }
  };

  return (
    <Box minH="100vh" bg="gray.900" p={{ base: 4, md: 10 }}>
      <VStack
        spacing={6}
        maxW="900px"
        mx="auto"
        align="stretch"
        bg="gray.800"
        borderRadius="xl"
        p={6}
        boxShadow="lg"
        border="1px solid"
        borderColor="gray.700"
      >
        <Flex align="center" justify="space-between">
          <IconButton
            aria-label="Back to admin dashboard"
            icon={<ArrowBackIcon />}
            onClick={() => router.push('/admin')}
            variant="ghost"
            colorScheme="teal"
            size="lg"
          />
          <Heading size="lg" color="gray.50" textAlign="center" flex="1">
            User Management
          </Heading>
        </Flex>
        <Flex direction={{ base: 'column', md: 'row' }} gap={4}>
          <Input
            placeholder="Search by email"
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
            bg="gray.700"
            color="white"
            borderColor="gray.600"
            focusBorderColor="teal.400"
            borderRadius="md"
            _placeholder={{ color: 'gray.400' }}
          />
          <Button
            colorScheme="teal"
            onClick={fetchUser}
            isLoading={loading}
            borderRadius="md"
            w={{ base: 'full', md: 'auto' }}
          >
            Search
          </Button>
        </Flex>
        {loading ? (
          <Spinner size="lg" color="teal.400" alignSelf="center" mt={4} />
        ) : users.length > 0 ? (
          <Table variant="simple" colorScheme="gray">
            <Thead bg="gray.700">
              <Tr>
                <Th color="gray.50" py={3}>Email</Th>
                <Th color="gray.50" py={3}>Current Role</Th>
                <Th color="gray.50" py={3}>Change Role</Th>
              </Tr>
            </Thead>
            <Tbody>
              {users.map((user) => (
                <Tr key={user.email} _hover={{ bg: 'gray.750' }}>
                  <Td color="gray.50" py={3}>{user.email}</Td>
                  <Td color="gray.50" py={3}>{user.role}</Td>
                  <Td py={3}>
                    <Select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.email, e.target.value)}
                      bg="gray.700"
                      color="white"
                      size="sm"
                      w="150px"
                      borderRadius="md"
                      focusBorderColor="teal.400"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                      <option value="superadmin">Superadmin</option>
                    </Select>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        ) : (
          <Text color="gray.400" textAlign="center" py={4}>
            No user found. Try searching for an email.
          </Text>
        )}
      </VStack>
    </Box>
  );
}