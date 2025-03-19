'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  Heading,
  Text,
  Textarea,
  Button,
  useToast,
  Spinner,
  Flex,
  IconButton,
  HStack,
  Badge,
  Divider,
  Avatar,
  ScaleFade,
} from '@chakra-ui/react';
import { useRouter, useParams } from 'next/navigation';
import axios from 'axios';
import { ArrowBackIcon, CloseIcon, ChatIcon } from '@chakra-ui/icons';

export default function TicketPage() {
  const { ticketId } = useParams();
  const router = useRouter();
  const [ticket, setTicket] = useState(null);
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState(null);
  const [isReplying, setIsReplying] = useState(false); // Tracks reply submission
  const [isClosing, setIsClosing] = useState(false);   // Tracks close submission
  const toast = useToast();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const token = localStorage.getItem('token');
    const user = token ? require('jsonwebtoken').decode(token) : null;

    if (!user || !['admin', 'superadmin'].includes(user.role)) {
      toast({
        title: 'Access Denied',
        description: 'Only admins can view this page.',
        status: 'error',
        position: 'top',
      });
      router.push('/');
      return;
    }

    setRole(user.role);
    fetchTicket();
  }, [ticketId, router, toast]);

  const fetchTicket = async () => {
    try {
      const { data } = await axios.get(`/api/tickets?ticketId=${ticketId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setTicket(data.ticket);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load ticket',
        status: 'error',
        position: 'top',
      });
      router.push('/admin');
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async () => {
    if (!reply.trim()) {
      toast({ title: 'Reply cannot be empty', status: 'warning', position: 'top' });
      return;
    }
    setIsReplying(true); // Disable the reply button and show loading
    try {
      await axios.put(
        '/api/tickets',
        {
          ticketId,
          response: reply,
          status: 'Waiting for user response',
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );
      toast({ title: 'Reply sent', status: 'success', position: 'top' });
      setReply('');
      fetchTicket(); // Refresh ticket data
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || error.message,
        status: 'error',
        position: 'top',
      });
    } finally {
      setIsReplying(false); // Re-enable the reply button
    }
  };

  const handleClose = async () => {
    setIsClosing(true); // Disable the close button and show loading
    try {
      await axios.put(
        '/api/tickets',
        {
          ticketId,
          status: 'closed',
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );
      toast({ title: 'Ticket closed', status: 'success', position: 'top' });
      fetchTicket(); // Refresh ticket data
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || error.message,
        status: 'error',
        position: 'top',
      });
    } finally {
      setIsClosing(false); // Re-enable the close button
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

  if (loading) {
    return (
      <Flex minH="100vh" align="center" justify="center">
        <Spinner size="xl" color="teal.400" thickness="4px" speed="0.65s" />
      </Flex>
    );
  }

  if (!ticket || !role) return null;

  return (
    <Box minH="100vh" py={8} px={{ base: 4, md: 10 }}>
      <ScaleFade initialScale={0.9} in={true}>
        <VStack
          spacing={6}
          maxW="800px"
          mx="auto"
          align="stretch"
          bg="gray.800"
          borderRadius="xl"
          p={6}
          boxShadow="lg"
          border="1px solid"
          borderColor="gray.700"
          transition="all 0.3s"
          _hover={{ boxShadow: 'xl', borderColor: 'teal.600' }}
        >
          {/* Header */}
          <Flex align="center" justify="space-between" wrap="wrap" gap={2}>
            <IconButton
              aria-label="Back to admin dashboard"
              icon={<ArrowBackIcon />}
              onClick={() => router.push('/admin')}
              variant="ghost"
              colorScheme="teal"
              size="lg"
              _hover={{ bg: 'teal.900', transform: 'scale(1.1)' }}
              transition="all 0.2s"
            />
            <HStack spacing={3}>
              <Badge
                colorScheme={
                  ticket.status === 'closed'
                    ? 'red'
                    : ticket.status === 'Waiting for user response'
                    ? 'teal'
                    : 'gray'
                }
                fontSize="sm"
                px={3}
                py={1}
                borderRadius="full"
                boxShadow="sm"
                textTransform="capitalize"
              >
                {ticket.status}
              </Badge>
              <Text fontSize="xs" color="gray.400">
                Created: {new Date(ticket.createdAt).toLocaleString()}
              </Text>
            </HStack>
          </Flex>

          {/* Ticket Details */}
          <VStack align="start" spacing={4} w="full">
            <Text fontSize="lg" color="white" fontWeight="bold">
              {ticket.problemType
                ? `${ticket.problemType.charAt(0).toUpperCase() + ticket.problemType.slice(1)}${
                    ticket.subProblem
                      ? ` - ${ticket.subProblem.charAt(0).toUpperCase() + ticket.subProblem.slice(1).replace(/([A-Z])/g, ' $1')}`
                      : ''
                  }`
                : 'Untitled Issue'}
            </Text>
            <Divider borderColor="gray.600" />
            <HStack spacing={6} wrap="wrap" justify="space-between">
              <Box>
                <Text fontSize="xs" color="gray.400" fontWeight="medium">Game</Text>
                <Text fontSize="sm" color="white">{getGameDisplay(ticket.game)}</Text>
              </Box>
              <Box>
                <Text fontSize="xs" color="gray.400" fontWeight="medium">GraalID</Text>
                <Text fontSize="sm" color="white">{ticket.graalid}</Text>
              </Box>
              <Box>
                <Text fontSize="xs" color="gray.400" fontWeight="medium">User</Text>
                <HStack spacing={2}>
                  <Avatar size="xs" name={ticket.email} bg="teal.500" />
                  <Text fontSize="sm" color="white">{ticket.email}</Text>
                </HStack>
              </Box>
              <Box>
                <Text fontSize="xs" color="gray.400" fontWeight="medium">Assigned</Text>
                <Text fontSize="sm" color={ticket.assignedAdmin ? 'teal.300' : 'gray.500'}>
                  {ticket.assignedAdmin || 'Unassigned'}
                </Text>
              </Box>
            </HStack>
            <Box w="full">
              <Text fontSize="xs" color="gray.400" fontWeight="medium">Description</Text>
              <Box
                p={3}
                bg="gray.700"
                borderRadius="md"
                border="1px solid"
                borderColor="gray.600"
                color="white"
                fontSize="sm"
                whiteSpace="pre-wrap"
                boxShadow="inner"
              >
                {ticket.description}
              </Box>
            </Box>
            <HStack spacing={4} wrap="wrap">
              <Box>
                <Text fontSize="xs" color="gray.400" fontWeight="medium">Installed</Text>
                <Text fontSize="sm" color={ticket.installed === '1' ? 'green.300' : 'red.300'}>
                  {ticket.installed === '1' ? 'Yes' : ticket.installed === '0' ? 'No' : 'N/A'}
                </Text>
              </Box>
              {ticket.installed === '1' && (
                <Box>
                  <Text fontSize="xs" color="gray.400" fontWeight="medium">Started</Text>
                  <Text fontSize="sm" color={ticket.started === '1' ? 'green.300' : 'red.300'}>
                    {ticket.started === '1' ? 'Yes' : ticket.started === '0' ? 'No' : 'N/A'}
                  </Text>
                </Box>
              )}
            </HStack>
          </VStack>

          {/* Replies Section */}
          {ticket.replies?.length > 0 && (
            <VStack w="full" spacing={3} maxH="400px" overflowY="auto" pr={2}>
              <Divider borderColor="gray.600" />
              <Text fontSize="sm" color="gray.400" fontWeight="medium">
                Conversation
              </Text>
              {ticket.replies.map((reply, index) => (
                <Flex
                  key={index}
                  w="full"
                  p={3}
                  bg={reply.by === ticket.email ? 'gray.700' : 'teal.900'}
                  borderRadius="lg"
                  align="start"
                  boxShadow="sm"
                  border="1px solid"
                  borderColor={reply.by === ticket.email ? 'gray.600' : 'teal.800'}
                  transition="all 0.2s"
                  _hover={{ boxShadow: 'md', transform: 'translateY(-2px)' }}
                >
                  <Avatar
                    size="sm"
                    name={reply.by === ticket.email ? 'User' : 'Support'}
                    bg={reply.by === ticket.email ? 'gray.500' : 'teal.500'}
                    mr={3}
                  />
                  <Box>
                    <Text fontSize="xs" color="gray.300" fontWeight="medium">
                      {reply.by === ticket.email ? 'User' : reply.by} •{' '}
                      {new Date(reply.date).toLocaleString()}
                    </Text>
                    <Text fontSize="sm" color="white" whiteSpace="pre-wrap">
                      {reply.text}
                    </Text>
                  </Box>
                </Flex>
              ))}
            </VStack>
          )}

          {/* Reply Input */}
          {ticket.status !== 'closed' && (
            <VStack w="full" spacing={4}>
              <Textarea
                placeholder="Type your reply here..."
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                size="md"
                minH="120px"
                resize="vertical"
                focusBorderColor="teal.400"
                bg="gray.700"
                color="white"
                _placeholder={{ color: 'gray.400' }}
                borderRadius="md"
                boxShadow="inner"
                transition="all 0.2s"
                _focus={{ boxShadow: '0 0 0 2px teal.400, inset 0 1px 2px rgba(0, 0, 0, 0.2)' }}
              />
              <HStack w="full" justify="space-between">
                <Button
                  leftIcon={<ChatIcon />}
                  colorScheme="teal"
                  size="md"
                  flex="1"
                  onClick={handleReply}
                  isLoading={isReplying} // Shows loading spinner during reply
                  isDisabled={isReplying || !reply.trim()} // Disables during reply or if empty
                  bg="teal.600"
                  borderRadius="md"
                  boxShadow="md"
                  transition="all 0.2s"
                  _hover={{ bg: 'teal.700', transform: 'translateY(-2px)' }}
                >
                  Send Reply
                </Button>
                <Button
                  leftIcon={<CloseIcon />}
                  colorScheme="red"
                  size="md"
                  flex="1"
                  onClick={handleClose}
                  isLoading={isClosing} // Shows loading spinner during close
                  isDisabled={isClosing} // Disables during close
                  variant="outline"
                  borderColor="red.500"
                  borderRadius="md"
                  boxShadow="md"
                  transition="all 0.2s"
                  _hover={{ bg: 'red.600', color: 'white', transform: 'translateY(-2px)' }}
                >
                  Close Ticket
                </Button>
              </HStack>
            </VStack>
          )}
        </VStack>
      </ScaleFade>
    </Box>
  );
}