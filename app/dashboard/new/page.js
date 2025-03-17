'use client';

import { Box, Heading } from '@chakra-ui/react';
import TicketForm from '../../../components/TicketForm';
import { redirect } from 'next/navigation';
import axios from 'axios';
import { useEffect, useState } from 'react';

export default function NewTicket() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Ensure this runs only on the client side
    setIsClient(true);
    const token = localStorage.getItem('token');
    if (!token) redirect('/');

    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }, []);

  if (!isClient) {
    // Render nothing or a loading spinner until the client-side check is complete
    return null;
  }

  const user = require('jsonwebtoken').decode(localStorage.getItem('token'));

  return (
    <Box p={8}  minH="calc(100vh - 64px)" color="white">
        <Heading mb={6} fontSize="2xl" fontWeight="bold" textAlign="center">
          Create New Ticket
       </Heading>
      <TicketForm userEmail={user.email} onTicketCreated={() => redirect('/dashboard/tickets')} />
    </Box>
  );
}