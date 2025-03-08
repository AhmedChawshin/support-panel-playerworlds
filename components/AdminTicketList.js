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
  Input,
  Button,
  useToast,
  HStack,
  StackDivider,
} from '@chakra-ui/react';
import axios from 'axios';
import { useState } from 'react';

export default function AdminTicketList({ tickets, userEmail, onReply }) {
  const [replies, setReplies] = useState({});
  const toast = useToast();

  const handleReplyChange = (ticketId, value) => {
    setReplies((prev) => ({ ...prev, [ticketId]: value }));
  };

  const handleReply = async (ticketId) => {
    const replyText = replies[ticketId] || '';
    if (!replyText.trim()) {
      toast({ title: 'Reply cannot be empty', status: 'warning', position: 'top' });
      return;
    }
    try {
      await axios.put('/api/tickets', {
        ticketId,
        response: replyText,
        status: 'Waiting for user response',
      });
      toast({ title: 'Reply sent', status: 'success', position: 'top' });
      setReplies((prev) => ({ ...prev, [ticketId]: '' }));
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

  const handleClose = async (ticketId) => {
    try {
      await axios.put('/api/tickets', { ticketId, status: 'closed' });
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

  const getAssignedAdmin = (ticket) => {
    const adminReply = ticket.replies?.find((reply) => reply.by !== ticket.email);
    return adminReply ? adminReply.by : 'Unassigned';
  };

  return (
    <Accordion allowMultiple w="full" defaultIndex={[]}>
      {tickets.map((ticket) => (
        <AccordionItem
          key={ticket._id}
          border="none"
          mb={4}
          bg="gray.800"
          borderRadius="lg"
          boxShadow="sm"
          transition="all 0.2s ease"
          _hover={{ boxShadow: 'md' }}
        >
          <AccordionButton p={5} _hover={{ bg: 'gray.700' }}>
            <Box flex="1" textAlign="left">
              <Text fontWeight="medium" fontSize="lg" color="gray.50">
                {ticket.title}
              </Text>
              <Text fontSize="sm" color="gray.400">
                Type: {ticket.type} | GraalID: {ticket.graalid} | User: {ticket.email} | Assigned: {getAssignedAdmin(ticket)}
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
            >
              {ticket.status}
            </Badge>
            <AccordionIcon ml={2} color="gray.400" />
          </AccordionButton>
          <AccordionPanel pb={6} pt={4} bg="gray.800" borderRadius="lg">
            <VStack align="start" spacing={4} divider={<StackDivider borderColor="gray.700" />}>
              <Text color="gray.50">{ticket.description}</Text>
              {ticket.replies?.length > 0 && (
                <VStack w="full" spacing={3}>
                  {ticket.replies.map((reply, index) => (
                    <Box
                      key={index}
                      w="full"
                      p={3}
                      bg="gray.700"
                      borderRadius="md"
                      borderLeft="3px solid"
                      borderColor={reply.by === userEmail ? 'teal.400' : 'gray.600'}
                    >
                      <Text fontSize="sm" color="gray.400">
                        {reply.by === userEmail ? 'You' : reply.by === ticket.email ? 'User' : `Support (${reply.by})`} •{' '}
                        {new Date(reply.date).toLocaleString()}
                      </Text>
                      <Text color="gray.50">{reply.text}</Text>
                    </Box>
                  ))}
                </VStack>
              )}
              {ticket.status !== 'closed' && (
                <VStack w="full" spacing={3}>
                  <Input
                    placeholder="Add a reply..."
                    value={replies[ticket._id] || ''}
                    onChange={(e) => handleReplyChange(ticket._id, e.target.value)}
                    size="md"
                    focusBorderColor="teal.400"
                  />
                  <HStack w="full" justify="space-between">
                    <Button
                      colorScheme="teal"
                      size="md"
                      onClick={() => handleReply(ticket._id)}
                      isDisabled={!replies[ticket._id]?.trim()}
                    >
                      Reply
                    </Button>
                    <Button
                      variant="outline"
                      size="md"
                      colorScheme="red"
                      onClick={() => handleClose(ticket._id)}
                    >
                      Close Ticket
                    </Button>
                  </HStack>
                </VStack>
              )}
            </VStack>
          </AccordionPanel>
        </AccordionItem>
      ))}
    </Accordion>
  );
}