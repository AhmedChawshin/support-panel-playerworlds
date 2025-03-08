"use client"
import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: false,
  },
  styles: {
    global: {
      body: {
        bg: 'gray.900',
        color: 'gray.50',
        fontFamily: "'Inter', sans-serif",
        lineHeight: '1.6',
      },
      '*': {
        transition: 'color, background-color 0.2s ease-in-out',
      },
    },
  },
  colors: {
    gray: {
      50: '#F9FAFB',
      400: '#94A3B8',
      700: '#374151',
      800: '#1E293B',
      900: '#0F172A',
    },
    teal: {
      400: '#2DD4BF',
      500: '#14B8A6',
    },
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: '500',
        borderRadius: 'lg',
        transition: 'all 0.2s ease',
      },
      variants: {
        solid: {
          bg: 'teal.500',
          color: 'gray.50',
          _hover: { bg: 'teal.400', boxShadow: 'md' },
          _active: { bg: 'teal.500' },
        },
        ghost: {
          color: 'gray.400',
          _hover: { color: 'teal.400', bg: 'gray.800' },
        },
        outline: {
          borderColor: 'gray.700',
          color: 'gray.50',
          _hover: { borderColor: 'teal.400', color: 'teal.400', bg: 'gray.800' },
        },
      },
    },
    Input: {
      baseStyle: {
        field: {
          bg: 'gray.800',
          borderColor: 'gray.700',
          borderRadius: 'lg',
          color: 'gray.50',
          _hover: { borderColor: 'gray.600' },
          _focus: { borderColor: 'teal.400', boxShadow: '0 0 0 1px teal.400' },
        },
      },
    },
    Heading: {
      baseStyle: {
        fontWeight: '600',
        color: 'gray.50',
      },
    },
    Box: {
      baseStyle: {
        borderRadius: 'lg',
      },
    },
    Accordion: {
      baseStyle: {
        container: { borderColor: 'gray.700' },
        button: { _hover: { bg: 'gray.800' } },
      },
    },
  },
});

export default theme;