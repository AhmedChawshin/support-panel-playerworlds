'use client';

import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  Badge,
  Button,
  Tooltip,
} from '@chakra-ui/react';
import { useRouter } from 'next/navigation';

export default function AdminTicketList({ tickets }) {
  const router = useRouter();

  const getAssignedAdmin = (ticket) => {
    return ticket.assignedAdmin || 'Unassigned'; // Use assignedAdmin directly
  };

  const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <Box
      bg="gray.800"
      borderRadius="lg"
      overflow="hidden"
      boxShadow="sm"
      border="1px solid"
      borderColor="gray.700"
    >
      <Table variant="simple" size="sm">
        <Thead bg="gray.700">
          <Tr>
            <Th color="gray.50" py={2} px={3}>Type</Th>
            <Th color="gray.50" py={2} px={3}>Title</Th>
            <Th color="gray.50" py={2} px={3}>Status</Th>
            <Th color="gray.50" py={2} px={3}>User</Th>
            <Th color="gray.50" py={2} px={3}>Assigned</Th>
            <Th color="gray.50" py={2} px={3}>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {tickets.length === 0 ? (
            <Tr>
              <Td colSpan={7} py={4}>
                <Text color="gray.400" textAlign="center">No tickets found</Text>
              </Td>
            </Tr>
          ) : (
            tickets.map((ticket) => (
              <Tr
                key={ticket._id}
                bg="gray.800"
                _hover={{ bg: 'gray.750', transition: 'background-color 0.2s ease' }}
              >
                <Td py={2} px={3}>
                  <Text color="gray.50" fontSize="xs">
                    {ticket.type}
                  </Text>
                </Td>
                <Td py={2} px={3}>
                  <Text color="gray.50" fontSize="xs" fontWeight="medium">
                    {truncateText(ticket.title, 15)}
                  </Text>
                </Td>
                <Td py={2} px={3}>
                  <Badge
                    colorScheme={
                      ticket.status === 'closed'
                        ? 'red'
                        : ticket.status === 'Waiting for user response'
                        ? 'teal'
                        : 'gray'
                    }
                    px={1}
                    py={0.5}
                    borderRadius="sm"
                    fontSize="2xs"
                  >
                    {ticket.status}
                  </Badge>
                </Td>
                <Td py={2} px={3}>
                  <Text color="gray.50" fontSize="xs">
                    {truncateText(ticket.email, 12)}
                  </Text>
                </Td>
                <Td py={2} px={3}>
                  <Tooltip label={getAssignedAdmin(ticket)} bg="gray.700" color="white" placement="top">
                    <Text color="gray.50" fontSize="xs">
                      {truncateText(getAssignedAdmin(ticket), 12)}
                    </Text>
                  </Tooltip>
                </Td>

                <Td py={2} px={3}>
                  <Button
                    size="xs"
                    colorScheme="teal"
                    variant="ghost"
                    onClick={() => router.push(`/admin/tickets/${ticket._id}`)}
                    mr={1}
                  >
                    View
                  </Button>
                </Td>
              </Tr>
            ))
          )}
        </Tbody>
      </Table>
    </Box>
  );
}