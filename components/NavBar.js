'use client';

import { Box, Flex, HStack, Button, Heading, IconButton, Menu, MenuButton, MenuList, MenuItem } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { FaTicketAlt, FaBars } from 'react-icons/fa';

export default function NavBar() {
  const router = useRouter();
  const [token, setToken] = useState(null);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const updateToken = () => {
      const storedToken = localStorage.getItem('token');
      setToken(storedToken);
      if (storedToken) {
        const decoded = require('jsonwebtoken').decode(storedToken);
        setUserRole(decoded?.role || 'user');
      } else {
        setUserRole(null);
      }
    };

    updateToken();
    window.addEventListener('storage', updateToken);
    window.addEventListener('token-updated', updateToken);

    return () => {
      window.removeEventListener('storage', updateToken);
      window.removeEventListener('token-updated', updateToken);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUserRole(null);
    router.push('/');
    window.dispatchEvent(new Event('token-updated'));
  };

  return (
    <Box bg="gray.800" px={6} py={4} borderBottom="1px" borderColor="gray.700" position="sticky" top={0} zIndex={10}>
      <Flex align="center" justify="space-between" maxW="1200px" mx="auto">
        <HStack spacing={3}>
        <Heading
  size="md"
  cursor="pointer"
  onClick={() => router.push('/dashboard')}
  color="gray.50"
  _hover={{ color: 'teal.400' }}
>
  <img
    src="https://home.graalonline.com/images/logograalonline.png"
    alt="Logo"
    
    style={{
      transition: 'transform 0.2s ease-in-out',
      height: '70px',
    }}
    onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
    onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
  />
</Heading>

        </HStack>
        {token ? (
          <HStack spacing={4} display={{ base: 'none', md: 'flex' }}>
            <Button variant="ghost" onClick={() => router.push('/dashboard/tickets')}>
              Tickets
            </Button>
            <Button variant="ghost" onClick={() => router.push('/dashboard/new')}>
              New Ticket
            </Button>
            {userRole === 'admin' && (
              <Button variant="ghost" onClick={() => router.push('/admin')}>
                Admin
              </Button>
            )}
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </HStack>
        ) : null}
        {token && (
          <Menu>
            <MenuButton
              as={IconButton}
              icon={<FaBars />}
              variant="ghost"
              color="gray.400"
              display={{ base: 'flex', md: 'none' }}
              aria-label="Menu"
            />
            <MenuList bg="gray.800" borderColor="gray.700">
              <MenuItem onClick={() => router.push('/dashboard/tickets')} color="gray.50">
                Tickets
              </MenuItem>
              <MenuItem onClick={() => router.push('/dashboard/new')} color="gray.50">
                New Ticket
              </MenuItem>
              {userRole === 'admin' && (
                <MenuItem onClick={() => router.push('/admin')} color="gray.50">
                  Admin
                </MenuItem>
              )}
              <MenuItem onClick={handleLogout} color="gray.50">
                Logout
              </MenuItem>
            </MenuList>
          </Menu>
        )}
      </Flex>
    </Box>
  );
}