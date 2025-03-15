'use client';

import { Box, Flex, HStack, Text, IconButton } from '@chakra-ui/react';
import { FaTwitter, FaDiscord, FaFacebook } from 'react-icons/fa';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

export default function Footer() {
  return (
    <MotionBox
      as="footer"
      bg="gray.800"
      color="gray.400"
      py={6}
      px={{ base: 4, md: 10 }}
      borderTop="1px solid"
      borderColor="gray.700"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Flex
        maxW="1200px"
        mx="auto"
        direction={{ base: 'column', md: 'row' }}
        align="center"
        justify="space-between"
        gap={4}
      >
        <Text mt={4} _hover={{ color: 'teal.400' }} transition="color 0.2s"  fontSize="xs" color="gray.500">
        © {new Date().getFullYear()} GraalOnline. All rights reserved.
      </Text>

        {/* Right Section: Social Icons */}
        <HStack spacing={4}>
          <IconButton
            as="a"
            href="https://twitter.com/graalonline"
            target="_blank"
            aria-label="Twitter"
            icon={<FaTwitter />}
            size="sm"
            variant="ghost"
            color="gray.400"
            _hover={{ color: 'teal.400', bg: 'gray.700', transform: 'scale(1.1)' }}
            transition="all 0.2s"
          />
          <IconButton
            as="a"
            href="https://discord.com/invite/graalians"
            target="_blank"
            aria-label="Discord"
            icon={<FaDiscord />}
            size="sm"
            variant="ghost"
            color="gray.400"
            _hover={{ color: 'teal.400', bg: 'gray.700', transform: 'scale(1.1)' }}
            transition="all 0.2s"
          />
          <IconButton
            as="a"
            href="https://www.facebook.com/graalonline/"
            target="_blank"
            aria-label="Facebook"
            icon={<FaFacebook />}
            size="sm"
            variant="ghost"
            color="gray.400"
            _hover={{ color: 'teal.400', bg: 'gray.700', transform: 'scale(1.1)' }}
            transition="all 0.2s"
          />
        </HStack>
      </Flex>
    </MotionBox>
  );
}