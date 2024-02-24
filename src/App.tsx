import {
  Button,
  Center,
  ChakraProvider,
  Flex,
  HStack,
  Heading,
  Stack,
  Text,
} from '@chakra-ui/react';
//import useMethods from 'use-methods';
import { useEffect, useRef, useState } from "react";

import { DAY_1 } from './constants';

export type Group = {
  category: string;
  items: string[];
  difficulty: 1 | 2 | 3 | 4;
};

type Options = {
  groups: Group[];
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

const useGame = (options: Options) => {
  const initialState: State = {
    incomplete: options.groups,
    complete: [],
    items: shuffle(options.groups.flatMap((g) => g.items)),
    activeItems: [],
    mistakes: 0,
  };
  const savedState = JSON.parse(window.localStorage.getItem("connectionsState") ?? JSON.stringify(initialState))

  return savedState;
//   const [state, fns] = useMethods(methods, savedState);

//   return {
//     ...state,
//     ...fns,
//   };
 };

export const App = () => {
  //const responsetext = GetGameData();
  //const [game, setGame] = useState<State>();
  // complete: Group[];
  // incomplete: Group[];
  // items: string[];
  const [activeItems, setActiveItems] = useState<string[]>([]);
  const [incomplete, setIncomplete] = useState<Group[]>([]);
  const [complete, setComplete] = useState<Group[]>([]);
  const [items, setItems] = useState<string[]>([]);
  const [mistakes, setMistakes] = useState(0);
  //mistakes: number;
  
  useEffect(() => {
    //fetch("https://rg-freebee-api.azurewebsites.net/api/generate_puzzle")
    fetch("day1.json")
    .then((res) => res.json())
      .then((grps) => {
        setIncomplete(grps);
        setComplete([]);
        setItems(grps.flatMap((g) => g.items));
        //items: shuffle(options.groups.flatMap((g) => g.items)),
        setActiveItems([]);
        //mistakes: 0,
    
      })//setGame(useGame({groups: grps})));
  }, []);

  const toggleActive = (item: string) => {
    if (activeItems.includes(item)) {
      //game.activeItems = game.activeItems.filter((i) => i !== item);
      setActiveItems(activeItems.filter((i) => i !== item ));
    } else if (activeItems.length < 4) {
      setActiveItems((prev) => [...prev, item]);
    }
  }

  // shuffle() {
  //   shuffle(state.items);
  // },

   const deselectAll = () => {
    //if (!game) return;
    setActiveItems([]);
   }

  const submit = () => {
     const foundGroup = incomplete.find((group) =>
       group.items.every((item) => activeItems.includes(item)),
     );

    if (foundGroup) {
      setComplete((prev) => [...prev, foundGroup]);
      console.log("incomplete length is " + incomplete.length);
      let newIncomplete = incomplete.filter((group) => group !== foundGroup);
      setIncomplete(newIncomplete);
      setItems(newIncomplete.flatMap((group) => group.items));
      console.log("incomplete length is " + newIncomplete.length);
      setActiveItems([]);
    } else {
      setMistakes((prev) => prev+1);
      setActiveItems([]);
    }
  //   window.localStorage.setItem("connectionsState",F JSON.stringify(state));
  }

  //if (!game) return;
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
            {complete.map((group) => (
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

            {chunk(items, 4).map((row) => (
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
                      onClick={() => toggleActive(item)}
                      isActive={activeItems.includes(item)}
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
            <Text>Mistakes: {mistakes}</Text>
          </HStack>
          <HStack>
            <Button
              colorScheme="black"
              variant="outline"
              rounded="full"
              borderWidth="2px"
              onClick={shuffle}
            >
              Shuffle
            </Button>
            <Button
              colorScheme="black"
              variant="outline"
              rounded="full"
              borderWidth="2px"
              onClick={deselectAll}
            >
              Deselect All
            </Button>
            <Button
              colorScheme="black"
              variant="outline"
              rounded="full"
              borderWidth="2px"
              isDisabled={activeItems.length !== 4}
              onClick={submit}
            >
              Submit
            </Button>
          </HStack>
        </Stack>
      </Flex>
    </ChakraProvider>
  );
};
