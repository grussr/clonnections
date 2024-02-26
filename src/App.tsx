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

export type Group = {
  category: string;
  items: string[];
  difficulty: 1 | 2 | 3 | 4;
};

type Game = {
  groups: Group[];
}

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

const shuffleArray = <T,>(list: T[]): T[] => {
  return list.sort(() => 0.5 - Math.random());
};

export const App = () => {
  const [game, setGame] = useState<Game>();

  const [activeItems, setActiveItems] = useState<string[]>([]);
  const [incomplete, setIncomplete] = useState<Group[]>([]);
  const [complete, setComplete] = useState<Group[]>([]);
  const [itemsInOrder, setItemsInOrder] = useState<string[]>([]);
  const [mistakes, setMistakes] = useState(0);
  
  useEffect(() => {
    fetch("day1.json")
    .then((res) => res.json())
      .then((grps) => {
        setGame(grps);
      })
  }, []);

  const localRef = useRef<string>();
  useEffect(() => {
    if (!game) return;
    localRef.current = "clonnections_day";
    setComplete(
      JSON.parse(window.localStorage.getItem(localRef.current+"complete") ?? "[]")
    );
    setIncomplete(
      JSON.parse(window.localStorage.getItem(localRef.current+"incomplete") ?? JSON.stringify(game))
    );
    shuffle();
  }, [game]);
  useEffect(() => {
    console.log("resetting order");
    setItemsInOrder(shuffleArray(incomplete.flatMap((group) => group.items)));
  }, [incomplete])
  useEffect(() => {
    if (!localRef.current) return;
    window.localStorage.setItem(localRef.current+"complete", JSON.stringify(complete));
    window.localStorage.setItem(localRef.current+"incomplete", JSON.stringify(incomplete));
  }, [complete, incomplete]);

  const toggleActive = (item: string) => {
    if (activeItems.includes(item)) {
      setActiveItems(activeItems.filter((i) => i !== item ));
    } else if (activeItems.length < 4) {
      setActiveItems((prev) => [...prev, item]);
    }
  }

   const shuffle = () => {
    setItemsInOrder(shuffleArray(incomplete.flatMap((group) => group.items)));
  }
   const deselectAll = () => {
    setActiveItems([]);
   }

  const submit = () => {
     const foundGroup = incomplete.find((group) =>
       group.items.every((item) => activeItems.includes(item)),
     );

    if (foundGroup) {
      setComplete((prev) => [...prev, foundGroup]);
      
      setIncomplete((prev) => prev.filter((group) => group !== foundGroup));
      
      setActiveItems([]);
    } else {
      setMistakes((prev) => prev+1);
      setActiveItems([]);
    }
  }

  if (!game) return;
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

            {chunk(itemsInOrder, 4).map((row) => (
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
