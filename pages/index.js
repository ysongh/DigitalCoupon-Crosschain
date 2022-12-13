import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Container, SimpleGrid, Box, Heading, Text, Image, ButtonGroup, Button, Center } from '@chakra-ui/react';

export default function Home() {
  const router = useRouter();

  return (
    <Box bg="#F4F1ED">
      <Container maxW='1200px'>
        <SimpleGrid minChildWidth='300px' columns={2} spacing={10}>
          <div>
            <Heading as='h1' size='2xl' mt={14}>
              Create product offers and incentivize sharing
            </Heading>
            <Text fontSize='2xl' mt={3}>
              Cross-Chain power by Axelar
            </Text>
            <ButtonGroup variant='outline' spacing='3' mt={4}>
              <Button colorScheme='orange' variant='solid' size='lg' onClick={() => router.push("/coupons")}>
                Get Started
              </Button>
            </ButtonGroup>
          </div>
         
          <Image src="./assets/shoppingimage.png" alt="Shopping" mt='10' />
        </SimpleGrid>

        <SimpleGrid minChildWidth='300px' columns={[3]} spacing={10} mt='20' pb='20'>
          <Box maxW='sm' bg='white' borderWidth='1px' borderRadius='lg' overflow='hidden' py='5'>
            <center>
              <Image src="./assets/shoppingicon1.png" alt="Shopping Icon 1" style={{ width: "100px", height: '100px' }}/>
              <Text fontSize='xl' mt={2}>Offers Low-cost, easy-to-use platform</Text>
            </center>
          </Box>
          <Box maxW='sm' bg='white' borderWidth='1px' borderRadius='lg' overflow='hidden' py='5'>
            <center>
              <Image src="./assets/shoppingicon2.png" alt="Shopping Icon 2" style={{ width: "120px", height: '100px' }}/>
              <Text fontSize='xl' mt={2}>Incentivize sharing though affiliate</Text>
            </center>
          </Box>
          <Box maxW='sm' bg='white' borderWidth='1px' borderRadius='lg' overflow='hidden' py='5'>
            <center>
              <Image src="./assets/shoppingicon3.png" alt="Shopping Icon 3" style={{ width: "120px", height: '100px' }}/>
              <Text fontSize='xl' mt={2}>Cross Chain</Text>
            </center>
          </Box>
        </SimpleGrid>
      </Container>
    </Box>
  )
}
