'use client';

import { useState, useEffect } from 'react';
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
import { redirect } from 'next/navigation';

export default function AdminDashboard() {
  const [isClient, setIsClient] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const toast = useToast();
  const ticketsPerPage = 10;

  useEffect(() => {
    // Ensure this runs only on the client side
    setIsClient(true);
    const token = localStorage.getItem('token');
    if (!token) redirect('/');

    const user = require('jsonwebtoken').decode(token);
    if (user.role !== 'admin') redirect('/');

    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    fetchTickets();
  }, [page]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('/api/tickets', {
        params: { page, limit: ticketsPerPage, search: searchQuery, sort: sortOrder, allTickets: true },
      });
      setTickets(data.tickets);
      setTotalPages(Math.ceil(data.total / ticketsPerPage));
      applyFilters(data.tickets);
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
  };

  const applyFilters = (ticketData) => {
    let result = [...ticketData];
    if (statusFilter !== 'all') {
      result = result.filter((ticket) => ticket.status === statusFilter);
    }
    setFilteredTickets(result);
  };

  const handleFilterChange = (status) => {
    setStatusFilter(status);
    applyFilters(tickets);
  };

  const handleSortChange = (sort) => {
    setSortOrder(sort);
    setPage(1);
    fetchTickets();
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearch = () => {
    setPage(1);
    fetchTickets();
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    fetchTickets();
  };

  if (!isClient) {
    // Render nothing or a loading spinner until the client-side check is complete
    return null;
  }

  const user = require('jsonwebtoken').decode(localStorage.getItem('token'));

  return (
    <Box p={10} minH="calc(100vh - 72px)" bg="gray.900">
      <VStack spacing={8} maxW="1200px" mx="auto" align="stretch">
        <Heading size="xl" textAlign="center" color="gray.50">
          Admin Dashboard
        </Heading>
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
              onChange={(e) => handleFilterChange(e.target.value)}
              size="sm"
              w={{ base: 'full', md: '200px' }}
              bg="gray.700"
              borderColor="gray.600"
              color="gray.50"
              _focus={{ borderColor: 'teal.400' }}
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
              onChange={(e) => handleSortChange(e.target.value)}
              size="sm"
              w={{ base: 'full', md: '200px' }}
              bg="gray.700"
              borderColor="gray.600"
              color="gray.50"
              _focus={{ borderColor: 'teal.400' }}
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
              _focus={{ borderColor: 'teal.400' }}
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