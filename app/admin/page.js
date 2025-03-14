'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  VStack,
  Heading,
  Select,
  HStack,
  Spinner,
  useToast,
  Text,
  Input,
  Flex,
  Button,
} from '@chakra-ui/react';
import AdminTicketList from '../../components/AdminTicketList';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [token, setToken] = useState(null);
  const toast = useToast();
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
      router.push('/');
      return;
    }

    setToken(storedToken);
    const user = require('jsonwebtoken').decode(storedToken);
    if (!user || !['admin', 'superadmin'].includes(user.role)) {
      router.push('/');
      return;
    }

    axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
    fetchTickets();
  }, [router, page, sortOrder, searchQuery]);

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('/api/tickets', {
        params: { page, limit: 10, search: searchQuery, sort: sortOrder, allTickets: true },
      });
      setTickets(data.tickets);
      setTotalPages(Math.ceil(data.total / 10));
      // Apply filter immediately after fetch
      const filtered = statusFilter === 'all' ? data.tickets : data.tickets.filter((ticket) => ticket.status === statusFilter);
      setFilteredTickets(filtered);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || error.message,
        status: 'error',
        position: 'top',
      });
    } finally {
      setLoading(false);
    }
  }, [page, sortOrder, searchQuery, statusFilter, toast]);

  const handleFilterChange = (e) => {
    const newStatus = e.target.value;
    setStatusFilter(newStatus);
    // Apply filter immediately to current tickets
    const filtered = newStatus === 'all' ? tickets : tickets.filter((ticket) => ticket.status === newStatus);
    setFilteredTickets(filtered);
  };

  const handleSortChange = (e) => {
    setSortOrder(e.target.value);
    setPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearch = () => {
    setPage(1);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  if (token === null) return null;

  const user = require('jsonwebtoken').decode(token);
  if (!user || !['admin', 'superadmin'].includes(user.role)) return null;

  return (
    <Box p={10} minH="calc(100vh - 72px)" bg="gray.900">
      <VStack spacing={8} maxW="1200px" mx="auto" align="stretch">
        <Heading size="xl" textAlign="center" color="gray.50">
          Admin Dashboard
        </Heading>
        {user.role === 'superadmin' && (
          <Button
            colorScheme="teal"
            size="md"
            onClick={() => router.push('/admin/users')}
            alignSelf="flex-start"
          >
            Manage Users
          </Button>
        )}
        <Flex
          direction={{ base: 'column', md: 'row' }}
          justify="space-between"
          align={{ base: 'stretch', md: 'center' }}
          gap={4}
          bg="gray.800"
          p={4}
          borderRadius="lg"
          boxShadow="sm"
          border="1px"
          borderColor="gray.700"
        >
          <HStack spacing={4} w={{ base: 'full', md: 'auto' }}>
            <Text fontSize="sm" fontWeight="medium" color="gray.400">
              Filter by Status:
            </Text>
            <Select
              value={statusFilter}
              onChange={handleFilterChange}
              size="sm"
              w={{ base: 'full', md: '200px' }}
              bg="gray.700"
              borderColor="gray.600"
              color="gray.50"
            >
              <option value="all">All</option>
              <option value="open">Open</option>
              <option value="Waiting for user response">Waiting for User</option>
              <option value="closed">Closed</option>
            </Select>
          </HStack>
          <HStack spacing={4} w={{ base: 'full', md: 'auto' }}>
            <Text fontSize="sm" fontWeight="medium" color="gray.400">
              Sort by:
            </Text>
            <Select
              value={sortOrder}
              onChange={handleSortChange}
              size="sm"
              w={{ base: 'full', md: '200px' }}
              bg="gray.700"
              borderColor="gray.600"
              color="gray.50"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
            </Select>
          </HStack>
          <HStack spacing={4} w={{ base: 'full', md: 'auto' }}>
            <Input
              placeholder="Search by Email or GraalID"
              value={searchQuery}
              onChange={handleSearchChange}
              size="sm"
              bg="gray.700"
              borderColor="gray.600"
              color="gray.50"
            />
            <Button size="sm" colorScheme="teal" onClick={handleSearch}>
              Search
            </Button>
          </HStack>
        </Flex>
        {loading ? (
          <Spinner size="lg" m="auto" display="block" mt="20vh" color="teal.400" />
        ) : (
          <>
            <AdminTicketList tickets={filteredTickets} userEmail={user.email} onReply={fetchTickets} />
            <HStack justify="center" mt={4}>
              <Button
                size="sm"
                onClick={() => handlePageChange(page - 1)}
                isDisabled={page === 1}
              >
                Previous
              </Button>
              <Text color="gray.400">
                Page {page} of {totalPages}
              </Text>
              <Button
                size="sm"
                onClick={() => handlePageChange(page + 1)}
                isDisabled={page === totalPages}
              >
                Next
              </Button>
            </HStack>
          </>
        )}
      </VStack>
    </Box>
  );
}