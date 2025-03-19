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
  const [isReplying, setIsReplying] = useState(false); // Loading state for reply
  const [isClosing, setIsClosing] = useState(false);   // Loading state for close
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
    setIsReplying(true); // Disable button
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
    } finally {
      setIsReplying(false); // Re-enable button
    }
  };

  const handleClose = async () => {
    setIsClosing(true); // Disable button
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
    } finally {
      setIsClosing(false); // Re-enable button
    }
  };

  const getGameDisplay = (game) => {
    return game
      ?.replace('_', ' ')
      .replace('classic', 'GraalOnline Classic')
      .replace('era', 'GraalOnline Era')
      .replace('zone', 'GraalOnline Zone')
      .replace('olwest', 'GraalOnline Olwest') || 'Unknown Game';
  };

  const getProblemTitle = () => {
    const base = ticket.problemType ? ticket.problemType.charAt(0).toUpperCase() + ticket.problemType.slice(1) : 'Issue';
    return ticket.subProblem ? `${base} - ${ticket.subProblem.charAt(0).toUpperCase() + ticket.subProblem.slice(1).replace(/([A-Z])/g, ' $1')}` : base;
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
            {getProblemTitle()}
          </Text>
          <Text fontSize="xs" color="gray.400">
            Game: {getGameDisplay(ticket.game)} | GraalID: {ticket.graalid}
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
          <VStack align="start" spacing={1}>
            <Text fontSize="sm" color="gray.300" fontWeight="medium">Details:</Text>
            <Text color="gray.50" fontSize="sm" whiteSpace="pre-wrap">{ticket.description}</Text>
          </VStack>
          {ticket.replies?.length > 0 && (
            <VStack w="full" spacing={2}>
              <Text fontSize="sm" color="gray.300" fontWeight="medium">Replies:</Text>
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
                  isDisabled={!reply.trim() || isReplying} // Disable if empty or loading
                  isLoading={isReplying} // Show loading spinner
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
                    isDisabled={isClosing} // Disable if loading
                    isLoading={isClosing} // Show loading spinner
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
      {tickets.length === 0 ? (
        <Box p={4} textAlign="center">
          <Text color="gray.400">No tickets found</Text>
        </Box>
      ) : (
        tickets.map((ticket) => (
          <TicketItem key={ticket._id} ticket={ticket} userEmail={userEmail} onReply={onReply} />
        ))
      )}
    </Accordion>
  );
}