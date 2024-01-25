import {
  Button,
  Center,
  ChakraProvider,
  Flex,
  HStack,
  Heading,
  Stack,
  Text,
  useInputGroupStyles,
} from '@chakra-ui/react';
import useMethods from 'use-methods';
import { useEffect, useRef, useState } from "react";

import { DAY_1 } from './constants';

export type Group = {
  category: string;
  items: string[];
  difficulty: 1 | 2 | 3 | 4;
};

type NytGroup = {
  level: number;
  members: string[];
}

type NytGame = {
  id: number;
  groups: Record<string, NytGroup>;
  startingGroups: string[][];
}

type Options = {
  groups: NytGame;
};

type State = {
  complete: Group[];
  incomplete: Group[];
  items: string[];
  activeItems: string[];
  mistakes: number;
};

const difficultyColor = (difficulty: 1 | 2 | 3 | 4): string => {
  return {
    1: '#fbd400',
    2: '#b5e352',
    3: '#729eeb',
    4: '#bc70c4',
  }[difficulty];
};

const chunk = <T,>(list: T[], size: number): T[][] => {
  const chunkCount = Math.ceil(list.length / size);
  return new Array(chunkCount).fill(null).map((_c: null, i: number) => {
    return list.slice(i * size, i * size + size);
  });
};

const shuffle = <T,>(list: T[]): T[] => {
  return list.sort(() => 0.5 - Math.random());
};

const methods = (state: State) => {
  return {
    toggleActive(item: string) {
      if (state.activeItems.includes(item)) {
        state.activeItems = state.activeItems.filter((i) => i !== item);
      } else if (state.activeItems.length < 4) {
        state.activeItems.push(item);
      }
    },

    shuffle() {
      shuffle(state.items);
    },

    deselectAll() {
      state.activeItems = [];
    },

    submit() {
      const foundGroup = state.incomplete.find((group) =>
        group.items.every((item) => state.activeItems.includes(item)),
      );

      if (foundGroup) {
        state.complete.push(foundGroup);
        const incomplete = state.incomplete.filter((group) => group !== foundGroup);
        state.incomplete = incomplete;
        state.items = incomplete.flatMap((group) => group.items);
        state.activeItems = [];
      } else {
        state.mistakes += 1;
        state.activeItems = [];

        /*if (state.mistakesRemaining === 0) {
          state.complete = [...state.incomplete];
          state.incomplete = [];
          state.items = [];
        }*/
      }
      window.localStorage.setItem("connectionsState", JSON.stringify(state));
    },
  };
};

const convertNytGame = (nytGame: NytGame): Group[] => {
  let cloneGame:Group[] = new Array(4);
  for (let i = 0; i < 4; i++) {
    let currentGroup = nytGame.groups[i];
    //cloneGame[i].difficulty = 1;
    console.log(currentGroup);
  }
  return cloneGame;
}

const useGame = (options: Options) => {
  const initialState: State = {
    incomplete: options.groups.groups,
    complete: [],
    items: shuffle(options.groups.flatMap((g) => g.items)),
    activeItems: [],
    mistakes: 0,
  };
  const savedState = JSON.parse(window.localStorage.getItem("connectionsState") ?? JSON.stringify(initialState))

  const [state, fns] = useMethods(methods, savedState);

  return {
    ...state,
    ...fns,
  };
};

export const App = () => {
  //const game = useGame({
  //  groups: DAY_1,
  //});

  const [gam, setGame] = useState<NytGame>();
  useEffect(() => {
    fetch("/puzzles/2024-01-10.json")
      .then((res) => res.json())
      .then(setGame);
  }, []);
  if (!gam) return;
  //console.log(Object.values(gam.groups)[0].members);
  const game = useEffect(() => { useGame({ groups: convertNytGame(gam) })}, [gam]);

  return (
    <ChakraProvider>
      <Flex h="100vh" w="100%" align="center" justify="center">
        <Stack spacing={4} align="center">
          <Heading size="3xl" fontFamily="Georgia" fontWeight="light">
            Connections
          </Heading>
          <Text fontWeight="semibold">Create four groups of four!</Text>
          <Center>
          <Stack>
            {game.complete.map((group) => (
              <Stack
                spacing={1}
                lineHeight={1}
                rounded="lg"
                align="center"
                justify="center"
                h="80px"
                w="100%"
                bg={difficultyColor(group.difficulty)}
              >
                <Text fontSize="l" fontWeight="extrabold" textTransform="uppercase">
                  {group.category}
                </Text>
                <Text fontSize="l" textTransform="uppercase">
                  {group.items.join(', ')}
                </Text>
              </Stack>
            ))}

            {chunk(game.items, 4).map((row) => (
              <>
                  <HStack>
                  {row.map((item) => (
                    <Button
                      w="25%"
                      h="80px"
                      bg="#efefe6"
                      fontSize="14px"
                      fontWeight="extrabold"
                      textTransform="uppercase"
                      onClick={() => game.toggleActive(item)}
                      isActive={game.activeItems.includes(item)}
                      _active={{
                        bg: '#5a594e',
                        color: 'white',
                      }}
                    >
                      {item}
                    </Button>
                  ))}
                </HStack>
              </>
            ))}
          </Stack>
          </Center>
          <HStack align="baseline">
            <Text>Mistakes: {game.mistakes}</Text>
          </HStack>
          <HStack>
            <Button
              colorScheme="black"
              variant="outline"
              rounded="full"
              borderWidth="2px"
              onClick={game.shuffle}
            >
              Shuffle
            </Button>
            <Button
              colorScheme="black"
              variant="outline"
              rounded="full"
              borderWidth="2px"
              onClick={game.deselectAll}
            >
              Deselect All
            </Button>
            <Button
              colorScheme="black"
              variant="outline"
              rounded="full"
              borderWidth="2px"
              isDisabled={game.activeItems.length !== 4}
              onClick={game.submit}
            >
              Submit
            </Button>
          </HStack>
        </Stack>
      </Flex>
    </ChakraProvider>
  );
};
