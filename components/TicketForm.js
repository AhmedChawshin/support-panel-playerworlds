'use client';

import { useState } from 'react';
import {
  VStack,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  Button,
  useToast,
  Box,
  Radio,
  RadioGroup,
  Stack,
  Text,
} from '@chakra-ui/react';
import axios from 'axios';

export default function TicketForm({ userEmail }) {
  const [graalid, setGraalid] = useState('');
  const [game, setGame] = useState('');
  const [installed, setInstalled] = useState('');
  const [started, setStarted] = useState('');
  const [problemType, setProblemType] = useState(''); 
  const [subProblem, setSubProblem] = useState(''); 
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const games = [
    'classic_iphone', 'classic_flash', 'classic_android',
    'era_iphone', 'era_flash', 'era_android',
    'zone_iphone', 'zone_flash', 'zone_android',
    'olwest_iphone', 'olwest_flash', 'olwest_android',
  ];

  const problemTypes = {
    purchase: ['noitems', 'cannotbuy', 'nocoins', 'novip', 'other'],
    account: ['dontfind', 'emailnotaccepted', 'emailnotsent', 'linksdontwork', 'cannotlogin', 'other'],
    rudeplayer: ['badnick', 'rudechat', 'badpicture', 'harassing', 'other'],
    gamebug: ['crash', 'wrongrules', 'badai', 'missingcards', 'missingbuttons', 'other'],
    disconnection: ['often', 'notoften'],
    pictureban: [],
    other: [],
  };

  const problemDescriptions = {
    purchase: {
      noitems: 'You don’t see any items displayed when you try to purchase something.',
      cannotbuy: 'You cannot buy anything.',
      nocoins: 'You didn’t receive any coins after purchasing coins.',
      novip: 'You didn’t receive the VIP subscription after purchasing it.',
      other: 'You had a problem with purchasing which wasn’t listed here.',
    },
    account: {
      dontfind: 'You didn’t find the menu for creating an account.',
      emailnotaccepted: 'The e-mail which you have entered has been rejected as being invalid.',
      emailnotsent: 'You have never received the confirmation e-mail even after checking the spam folder.',
      linksdontwork: 'The links in the e-mail which you have received don’t work.',
      cannotlogin: 'You have received the e-mail and clicked on the links but it still doesn’t let you login to the account.',
      other: 'You had a problem with the creation of accounts or registering a new device but the problem is not listed here.',
    },
    rudeplayer: {
      badnick: 'You have seen a player with an offensive nick name.',
      rudechat: 'You have seen a player which uses rude or racist language.',
      badpicture: 'You have seen a player who has an offensive profile picture.',
      harassing: 'Another player has tried to harass you.',
      other: 'There was a problem with another player which is not listed here.',
    },
    gamebug: {
      crash: 'You have experienced crashes of the game.',
      wrongrules: 'One of the rules in the game is wrong.',
      badai: 'The computer players in the game have played badly.',
      missingcards: 'Some cards were not shown in the game.',
      missingbuttons: 'Some buttons didn’t show for you.',
      other: 'There was a bug in the game which is not listed here.',
    },
    disconnection: {
      often: 'You are often disconnected from the game.',
      notoften: 'You have been disconnected from the game.',
    },
    pictureban: 'You are banned from uploading pictures and want to get unbanned.',
    other: 'You have experienced another problem not listed here.',
  };

  const formatProblemType = (type) => {
    return type
      .replace(/([A-Z])/g, ' $1') // Add space before capital letters
      .replace(/^./, str => str.toUpperCase()) // Capitalize first letter
      .trim(); // Remove extra spaces
  };

  const formatSubProblem = (sub) => {
    return sub
      .replace(/([A-Z])/g, ' $1') // Add space before capital letters
      .replace(/^./, str => str.toUpperCase()) // Capitalize first letter
      .trim(); // Remove extra spaces
  };

  const handleSubmit = async () => {
    if (!graalid || !game || !installed || (installed === '1' && !started) || (started === '1' && !problemType) || (problemTypes[problemType]?.length > 0 && !subProblem)) {
      toast({ title: 'Please complete all required steps', status: 'warning' });
      return;
    }
    if(description.length > 1000) {
      toast({ title: 'Description should not exceed 600 characters', status: 'warning' });
      return;
    }
    if(graalid.length > 30){
      toast({ title: 'Graalid should not exceed 30 characters', status: 'warning' });
      return;
    }
    setIsSubmitting(true);
    try {
      const formattedProblemType = formatProblemType(problemType); 
      const formattedSubProblem = subProblem ? formatSubProblem(subProblem) : ''; 
      await axios.post('/api/tickets', {
        email: userEmail,
        graalid,
        game,
        installed,
        started,
        problemType: formattedProblemType, 
        subProblem: formattedSubProblem, 
        description,
      });
      toast({ title: 'Ticket created!', status: 'success' });
      resetForm();
    } catch (error) {
      toast({ title: 'Error', description: error.response?.data?.message || error.message, status: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setGraalid('');
    setGame('');
    setInstalled('');
    setStarted('');
    setProblemType('');
    setSubProblem('');
    setDescription('');
  };

  return (
    <Box
      maxW="600px"
      mx="auto"
      p={6}
      bg="gray.800"
      borderRadius="lg"
      boxShadow="lg"
      border="1px solid"
      borderColor="gray.700"
    >
      <VStack spacing={6} align="stretch">
        <FormControl isRequired>
          <FormLabel color="gray.300" fontWeight="semibold">GraalID</FormLabel>
          <Input
            placeholder="Enter your GraalID"
            value={graalid}
            onChange={(e) => setGraalid(e.target.value)}
            bg="gray.700"
            borderColor="gray.600"
            _hover={{ borderColor: 'gray.500' }}
            _focus={{ borderColor: 'teal.400', boxShadow: '0 0 0 1px teal.400' }}
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel color="gray.300" fontWeight="semibold">Game</FormLabel>
          <Select
            placeholder="Select game and platform"
            value={game}
            onChange={(e) => {
              setGame(e.target.value);
              setInstalled('');
              setStarted('');
              setProblemType('');
              setSubProblem('');
            }}
            bg="gray.700"
            borderColor="gray.600"
            _hover={{ borderColor: 'gray.500' }}
            _focus={{ borderColor: 'teal.400', boxShadow: '0 0 0 1px teal.400' }}
          >
            {games.map((g) => (
              <option key={g} value={g}>
                {g.replace('_', ' ').replace('classic', 'GraalOnline Classic').replace('era', 'GraalOnline Era').replace('zone', 'GraalOnline Zone').replace('olwest', 'GraalOnline Olwest')}
              </option>
            ))}
          </Select>
        </FormControl>

        {game && (
          <FormControl isRequired>
            <FormLabel color="gray.300" fontWeight="semibold">Were you able to install the game?</FormLabel>
            <RadioGroup
              value={installed}
              onChange={(val) => {
                setInstalled(val);
                setStarted('');
                setProblemType('');
                setSubProblem('');
              }}
            >
              <Stack direction="row" spacing={5}>
                <Radio value="1" colorScheme="teal">Yes</Radio>
                <Radio value="0" colorScheme="teal">No</Radio>
              </Stack>
            </RadioGroup>
            {installed === '0' && (
              <Text mt={2} color="gray.400">
                <b>Your problem:</b> You were not able to install the game.
              </Text>
            )}
          </FormControl>
        )}

        {installed === '1' && (
          <FormControl isRequired>
            <FormLabel color="gray.300" fontWeight="semibold">Were you able to start the game?</FormLabel>
            <RadioGroup
              value={started}
              onChange={(val) => {
                setStarted(val);
                setProblemType('');
                setSubProblem('');
              }}
            >
              <Stack direction="row" spacing={5}>
                <Radio value="1" colorScheme="teal">Yes</Radio>
                <Radio value="0" colorScheme="teal">No</Radio>
              </Stack>
            </RadioGroup>
            {started === '0' && (
              <Text mt={2} color="gray.400">
                <b>Your problem:</b> You were able to install the game but cannot start it.
              </Text>
            )}
          </FormControl>
        )}

        {started === '1' && (
          <FormControl isRequired>
            <FormLabel color="gray.300" fontWeight="semibold">What kind of problem did happen?</FormLabel>
            <Select
              placeholder="Select problem type"
              value={problemType}
              onChange={(e) => {
                setProblemType(e.target.value);
                setSubProblem('');
              }}
              bg="gray.700"
              borderColor="gray.600"
              _hover={{ borderColor: 'gray.500' }}
              _focus={{ borderColor: 'teal.400', boxShadow: '0 0 0 1px teal.400' }}
            >
              {Object.keys(problemTypes).map((type) => (
                <option key={type} value={type}>
                  {formatProblemType(type)}
                </option>
              ))}
            </Select>
          </FormControl>
        )}

        {problemType && problemTypes[problemType].length > 0 && (
          <FormControl isRequired>
            <FormLabel color="gray.300" fontWeight="semibold">Specify the issue</FormLabel>
            <RadioGroup value={subProblem} onChange={setSubProblem}>
              <Stack spacing={3}>
                {problemTypes[problemType].map((sub) => (
                  <Radio key={sub} value={sub} colorScheme="teal">
                    {formatSubProblem(sub)} {/* Display as "Bad Nick" */}
                  </Radio>
                ))}
              </Stack>
            </RadioGroup>
            {subProblem && (
              <Text mt={2} color="gray.400">
                <b>Your problem:</b> {problemDescriptions[problemType][subProblem]}
              </Text>
            )}
          </FormControl>
        )}

        <FormControl>
          <FormLabel color="gray.300" fontWeight="semibold">Additional Information</FormLabel>
          <Textarea
            placeholder="Provide more details about the problem (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            bg="gray.700"
            borderColor="gray.600"
            _hover={{ borderColor: 'gray.500' }}
            _focus={{ borderColor: 'teal.400', boxShadow: '0 0 0 1px teal.400' }}
            rows={5}
          />
          {problemType && !subProblem && problemTypes[problemType].length === 0 && (
            <Text mt={2} color="gray.400">
              <b>Your problem:</b> {problemDescriptions[problemType]}
            </Text>
          )}
        </FormControl>

        <Button
          colorScheme="teal"
          size="lg"
          onClick={handleSubmit}
          isLoading={isSubmitting}
          bg="teal.500"
          _hover={{ bg: 'teal.600' }}
          w="full"
        >
          Submit Ticket
        </Button>
      </VStack>
    </Box>
  );
}