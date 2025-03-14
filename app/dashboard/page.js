'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  Heading,
  Button,
  StackDivider,
  ScaleFade,
  Flex,
  Text,
  HStack,
  Stat,
  StatLabel,
  StatNumber,
  Divider,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Spinner,
} from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { ViewIcon, AddIcon, SettingsIcon, FaChartLine } from '@chakra-ui/icons';
import axios from 'axios';

export default function Dashboard() {
  const [token, setToken] = useState(null);
  const [role, setRole] = useState(null);
  const [email, setEmail] = useState(null);
  const [isTokenChecked, setIsTokenChecked] = useState(false);
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const router = useRouter();

  // Fetch token, role, and email on client side
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const storedToken = localStorage.getItem('token');
    setToken(storedToken);

    if (storedToken) {
      const user = require('jsonwebtoken').decode(storedToken);
      setRole(user?.role || null);
      setEmail(user?.email || null);
    }
    setIsTokenChecked(true);
  }, []);

  // Redirect if no token
  useEffect(() => {
    if (isTokenChecked && !token) {
      router.push('/');
    }
  }, [isTokenChecked, token, router]);

  // Fetch stats for superadmin
  useEffect(() => {
    if (role === 'superadmin' && token) {
      setStatsLoading(true);
      axios
        .get('/api/admin/statistics', {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then(({ data }) => setStats(data))
        .catch((error) => console.error('Failed to fetch stats:', error))
        .finally(() => setStatsLoading(false));
    }
  }, [role, token]);

  // Prevent rendering until token is checked
  if (!isTokenChecked) {
    return null;
  }

  if (!token || !role || !email) {
    return null;
  }

  return (
    <Box minH="calc(100vh - 72px)" bg="gray.900" py={12} px={{ base: 4, md: 8 }}>
      <ScaleFade initialScale={0.95} in={true}>
        <VStack
          spacing={8}
          maxW="700px"
          mx="auto"
          align="stretch"
          bg="gray.800"
          borderRadius="lg"
          p={6}
          boxShadow="lg"
          border="1px solid"
          borderColor="gray.700"
          transition="all 0.3s"
          _hover={{ boxShadow: 'xl', borderColor: 'teal.600' }}
        >
          {/* Header */}
          <Flex direction="column" align="center" textAlign="center">
            <Heading
              size="xl"
              bgGradient="linear(to-r, teal.400, cyan.400)"
              bgClip="text"
              fontWeight="bold"
              mb={2}
            >
              Dashboard
            </Heading>
            <Text fontSize="sm" color="gray.400" letterSpacing="wide">
              Welcome, {email.charAt(0).toUpperCase() + email.slice(1)}
            </Text>
          </Flex>

          {/* Main Content */}
          <VStack spacing={6} align="stretch">
            {/* Statistics for Superadmin */}
            {role === 'superadmin' && (
              <Box>
                <Text
                  fontSize="lg"
                  fontWeight="semibold"
                  mb={4}
                  color="teal.300"
                  textAlign="center"
                >
                  Support Statistics
                </Text>
                {statsLoading ? (
                  <Flex justify="center">
                    <Spinner size="md" color="teal.400" />
                  </Flex>
                ) : stats ? (
                  <>
                    {/* Headline Stats */}
                    <HStack spacing={4} justify="space-around" wrap="wrap">
                      <Stat bg="gray.700" p={3} borderRadius="md" flex="1" minW="140px">
                        <StatLabel color="gray.300">New Tickets (24h)</StatLabel>
                        <StatNumber fontSize="xl">{stats.newTickets24h}</StatNumber>
                      </Stat>
                      <Stat bg="gray.700" p={3} borderRadius="md" flex="1" minW="140px">
                        <StatLabel color="gray.300">Avg Response (24h)</StatLabel>
                        <StatNumber fontSize="xl">
                          {stats.avgResponseTime24h
                            ? `${Math.round(stats.avgResponseTime24h / 3600)}h ${
                                Math.round((stats.avgResponseTime24h % 3600) / 60)
                              }m`
                            : 'N/A'}
                        </StatNumber>
                      </Stat>
                    </HStack>
                    <HStack spacing={4} justify="space-around" wrap="wrap" mt={4}>
                      <Stat bg="gray.700" p={3} borderRadius="md" flex="1" minW="140px">
                        <StatLabel color="gray.300">Total Tickets</StatLabel>
                        <StatNumber fontSize="xl">{stats.totalTickets}</StatNumber>
                      </Stat>
                      <Stat bg="gray.700" p={3} borderRadius="md" flex="1" minW="140px">
                        <StatLabel color="gray.300">Total Users</StatLabel>
                        <StatNumber fontSize="xl">{stats.totalUsers}</StatNumber>
                      </Stat>
                    </HStack>

                    {/* Agent Performance */}
                    <Box mt={6}>
                      <Text fontSize="md" color="gray.400" mb={2}>
                        Agent Performance (Past 24h)
                      </Text>
                      <Divider borderColor="gray.600" mb={3} />
                      <Table variant="simple" size="sm" colorScheme="gray">
                        <Thead>
                          <Tr>
                            <Th color="gray.300">Agent</Th>
                            <Th color="gray.300" isNumeric>Tickets</Th>
                            <Th color="gray.300" isNumeric>Response Time</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {stats.agentPerformance.map((agent) => (
                            <Tr key={agent.email}>
                              <Td>{agent.email}</Td>
                              <Td isNumeric>{agent.ticketsHandled}</Td>
                              <Td isNumeric>
                                {agent.avgResponseTime
                                  ? `${Math.round(agent.avgResponseTime / 3600)}h ${
                                      Math.round((agent.avgResponseTime % 3600) / 60)
                                    }m`
                                  : 'N/A'}
                              </Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </Box>
                  </>
                ) : (
                  <Text color="gray.500" textAlign="center">
                    Unable to load statistics
                  </Text>
                )}
              </Box>
            )}

            {/* Navigation Buttons */}
            <VStack
              spacing={4}
              align="stretch"
              divider={<StackDivider borderColor="gray.600" />}
            >
              {/* User Role: Show View Tickets and Create Ticket */}
              {role === 'user' && (
                <>
                  <Button
                    leftIcon={<ViewIcon />}
                    size="lg"
                    variant="ghost"
                    w="full"
                    color="gray.200"
                    _hover={{ bg: 'gray.700', color: 'teal.300', transform: 'translateX(4px)' }}
                    _active={{ bg: 'gray.600' }}
                    transition="all 0.2s"
                    onClick={() => router.push('/dashboard/tickets')}
                  >
                    View Tickets
                  </Button>
                  <Button
                    leftIcon={<AddIcon />}
                    size="lg"
                    colorScheme="teal"
                    w="full"
                    bg="teal.600"
                    _hover={{ bg: 'teal.500', transform: 'translateX(4px)' }}
                    _active={{ bg: 'teal.700' }}
                    transition="all 0.2s"
                    onClick={() => router.push('/dashboard/new')}
                  >
                    Create Ticket
                  </Button>
                </>
              )}

              {/* Admin/Superadmin Role: Show Admin Panel */}
              {(role === 'admin' || role === 'superadmin') && (
                <Button
                  leftIcon={<SettingsIcon />}
                  size="lg"
                  variant="ghost"
                  w="full"
                  color="gray.200"
                  _hover={{ bg: 'gray.700', color: 'teal.300', transform: 'translateX(4px)' }}
                  _active={{ bg: 'gray.600' }}
                  transition="all 0.2s"
                  onClick={() => router.push('/admin')}
                >
                  Manage Tickets
                </Button>
              )}

              {/* Superadmin Only: Show Edit Users */}
              {role === 'superadmin' && (
                <Button
                  leftIcon={<SettingsIcon />}
                  size="lg"
                  variant="ghost"
                  w="full"
                  color="gray.200"
                  _hover={{ bg: 'gray.700', color: 'teal.300', transform: 'translateX(4px)' }}
                  _active={{ bg: 'gray.600' }}
                  transition="all 0.2s"
                  onClick={() => router.push('/admin/users')}
                >
                  Edit Users
                </Button>
              )}
            </VStack>
          </VStack>
        </VStack>
      </ScaleFade>
    </Box>
  );
}