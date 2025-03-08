'use client';

import { useState, useEffect } from 'react';
import { Box, Heading, Spinner, useToast, HStack, Text, Button } from '@chakra-ui/react';
import TicketList from '../../../components/TicketList';
import axios from 'axios';
import { redirect } from 'next/navigation';

export default function Tickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [token, setToken] = useState(null);
  const toast = useToast();
  const ticketsPerPage = 10;

  useEffect(() => {
    // Ensure this runs only on the client
    const storedToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    setToken(storedToken);
  }, []);

  useEffect(() => {
    if (!token) return;
    
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    fetchTickets();
  }, [token, page]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('/api/tickets', {
        params: { page, limit: ticketsPerPage },
      });
      setTickets(data.tickets);
      setTotalPages(Math.ceil(data.total / ticketsPerPage));
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

  if (typeof window !== 'undefined' && !token) {
    redirect('/');
    return null;
  }

  const user = token ? require('jsonwebtoken').decode(token) : null;

  return (
    <Box p={10} minH="calc(100vh - 72px)">
      <Heading size="xl" mb={10} textAlign="center">
        Your Tickets
      </Heading>
      {loading ? (
        <Spinner size="lg" m="auto" display="block" mt="20vh" color="teal.400" />
      ) : (
        <>
          <TicketList tickets={tickets} userEmail={user?.email} onReply={fetchTickets} />
          <HStack justify="center" mt={4}>
            <Button size="sm" onClick={() => setPage(page - 1)} isDisabled={page === 1}>
              Previous
            </Button>
            <Text color="gray.400">
              Page {page} of {totalPages}
            </Text>
            <Button size="sm" onClick={() => setPage(page + 1)} isDisabled={page === totalPages}>
              Next
            </Button>
          </HStack>
        </>
      )}
    </Box>
  );
}
