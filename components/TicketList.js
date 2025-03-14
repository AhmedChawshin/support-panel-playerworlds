'use client';

import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Box,
  Text,
  VStack,
  Badge,
  Textarea,
  Button,
  useToast,
  HStack,
  StackDivider,
} from '@chakra-ui/react';
import axios from 'axios';
import { useState, useCallback, memo } from 'react';

// Memoized Ticket Item to prevent unnecessary re-renders
const TicketItem = memo(({ ticket, userEmail, onReply }) => {
  const [reply, setReply] = useState('');
  const toast = useToast();

  // Debounced reply handler to reduce state updates
  const handleReplyChange = useCallback((e) => {
    const value = e.target.value;
    setReply(value);
  }, []);

  const handleReply = async () => {
    if (!reply.trim()) {
      toast({ title: 'Reply cannot be empty', status: 'warning', position: 'top' });
      return;
    }
    try {
      await axios.put('/api/tickets', { ticketId: ticket._id, response: reply });
      toast({ title: 'Reply sent', status: 'success', position: 'top' });
      setReply('');
      onReply();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || error.message,
        status: 'error',
        position: 'top',
      });
    }
  };

  const handleClose = async () => {
    try {
      await axios.put('/api/tickets', { ticketId: ticket._id, status: 'closed' });
      toast({ title: 'Ticket closed', status: 'success', position: 'top' });
      onReply();
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
    <AccordionItem
      border="none"
      mb={4}
      bg="gray.800"
      borderRadius="lg"
      boxShadow="sm"
    >
      <AccordionButton p={4} _hover={{ bg: 'gray.700' }}>
        <Box flex="1" textAlign="left">
          <Text fontWeight="medium" fontSize="md" color="gray.50">
            {ticket.title}
          </Text>
          <Text fontSize="xs" color="gray.400">
            Type: {ticket.type} | GraalID: {ticket.graalid}
          </Text>
        </Box>
        <Badge
          colorScheme={
            ticket.status === 'closed'
              ? 'red'
              : ticket.status === 'Waiting for user response'
              ? 'teal'
              : 'gray'
          }
          ml={2}
          px={2}
          py={1}
          borderRadius="md"
          fontSize="xs"
        >
          {ticket.status}
        </Badge>
        <AccordionIcon ml={2} color="gray.400" />
      </AccordionButton>
      <AccordionPanel pb={4} pt={2} bg="gray.800" borderRadius="lg">
        <VStack align="start" spacing={3} divider={<StackDivider borderColor="gray.700" />}>
          <Text color="gray.50" fontSize="sm" whiteSpace="pre-wrap">{ticket.description}</Text>
          {ticket.replies?.length > 0 && (
            <VStack w="full" spacing={2}>
              {ticket.replies.map((reply, index) => (
                <Box
                  key={index}
                  w="full"
                  p={2}
                  bg="gray.700"
                  borderRadius="md"
                  borderLeft="3px solid"
                  borderColor={reply.by === userEmail ? 'teal.400' : 'gray.600'}
                >
                  <Text fontSize="xs" color="gray.400">
                    {reply.by === userEmail ? 'You' : 'Support'} • {new Date(reply.date).toLocaleString()}
                  </Text>
                  <Text color="gray.50" fontSize="sm" whiteSpace="pre-wrap">{reply.text}</Text>
                </Box>
              ))}
            </VStack>
          )}
          {ticket.status !== 'closed' && (
            <VStack w="full" spacing={2}>
              <Textarea
                placeholder="Add a reply..."
                value={reply}
                onChange={handleReplyChange}
                size="sm"
                minH="80px"
                resize="vertical"
                bg="gray.700"
                color="white"
                _placeholder={{ color: 'gray.400' }}
                borderRadius="md"
              />
              <HStack w="full" justify="space-between">
                <Button
                  colorScheme="teal"
                  size="sm"
                  onClick={handleReply}
                  isDisabled={!reply.trim()}
                  _hover={{ bg: 'teal.500' }}
                >
                  Reply
                </Button>
                {ticket.email === userEmail && (
                  <Button
                    variant="outline"
                    size="sm"
                    colorScheme="red"
                    onClick={handleClose}
                    _hover={{ bg: 'red.600' }}
                  >
                    Close Ticket
                  </Button>
                )}
              </HStack>
            </VStack>
          )}
        </VStack>
      </AccordionPanel>
    </AccordionItem>
  );
});

export default function TicketList({ tickets, userEmail, onReply }) {
  return (
    <Accordion allowMultiple w="full" maxW="800px" mx="auto">
      {tickets.map((ticket) => (
        <TicketItem key={ticket._id} ticket={ticket} userEmail={userEmail} onReply={onReply} />
      ))}
    </Accordion>
  );
}