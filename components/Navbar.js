import React, { useState } from 'react';
import Head from 'next/head';
import NextLink from 'next/link';
import { Box, Container, Flex, Image, Badge, Spacer, Link, Button } from '@chakra-ui/react';
import { ethers } from 'ethers';
import Web3Modal from 'web3modal';

import DigitalCoupon from '../artifacts/contracts/DigitalCoupon.sol/DigitalCoupon.json';
import { isTestnet } from '../config/constants';
import { formatAddress } from '../utils/formatAddress';

function Navbar({ ethAddress, tokenName, setETHAddress, setUserSigner, setDCContract, setTokenName }) {
  const [balance, setBalance] = useState('');
  const [chainName, setChainName] = useState('');

  const connectMetamask = async () => {
    let chains = isTestnet ? require('../config/testnet.json') : require('../config/local.json');

    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();

    const provider = new ethers.providers.Web3Provider(connection);  

    const signer = provider.getSigner();
    console.log(signer);
    setUserSigner(signer);

    const { chainId } = await provider.getNetwork();
    console.log(chainId)

    const address = await signer.getAddress();
    setETHAddress(address);

    const _balance = await provider.getBalance(address);
    setBalance(_balance.toString());

    if(chainId === 80001){
      const contract = new ethers.Contract(process.env.NEXT_PUBLIC_MUMBAI_CONTRACTADDRESS, DigitalCoupon.abi, signer);
      setDCContract(contract);
      setChainName("Mumbai");
      setTokenName("MATIC");
    }
    else if(chainId === 1287){
      const moonbeamChain = chains.find((chain) => chain.name === 'Moonbeam');
      const contract = new ethers.Contract(moonbeamChain.digitalCoupon, DigitalCoupon.abi, signer);
      console.log(contract)
      setDCContract(contract);
      setChainName("Moonbase");
      setTokenName("DEV");
    }
    else if(chainId === 2501){
      const avalancheChain = chains.find((chain) => chain.name === 'Avalanche');
      const contract = new ethers.Contract(avalancheChain.digitalCoupon, DigitalCoupon.abi, signer);
      console.log(contract)
      setDCContract(contract);
      setChainName("Local Avalanche");
      setTokenName("AVAX");
    }
    else if(chainId === 2500){
      const moonbeamChain = chains.find((chain) => chain.name === 'Moonbeam');
      const contract = new ethers.Contract(moonbeamChain.digitalCoupon, DigitalCoupon.abi, signer);
      console.log(contract)
      setDCContract(contract);
      setChainName("Local Moonbase");
      setTokenName("DEV");
    }
  }

  return (
    <Box bg='#f5eedf' p={2}>
       <Head>
        <title>Digital Coupon NFT</title>
        <meta name="description" content="Digital Coupon NFT" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Container maxW='1300px'>
        <Flex minWidth='max-content' alignItems='center' gap='2'>
          <Box>
            <NextLink href='/' passHref>
              <Image src="/assets/logo.png" alt="Logo" style={{ width: "200px", cursor: "pointer" }}/>
            </NextLink>
          </Box>
          <NextLink href='/' passHref>
            <Link>Home</Link>
          </NextLink>
          {ethAddress && <NextLink href='/my-coupons' passHref>
            <Link>My Coupons</Link>
          </NextLink>}
          {ethAddress && <NextLink href='/create-coupon' passHref>
            <Link>Create Coupon</Link>
          </NextLink>}
          <Spacer />
          {ethAddress && <p><Badge colorScheme='orange' fontSize='.9rem'>{chainName}</Badge> {balance / 10 ** 18} {tokenName}</p>}
          <Button colorScheme='orange' onClick={connectMetamask}>
            {ethAddress ? formatAddress(ethAddress) : 'Connect Wallet'}
          </Button>
        </Flex>
      </Container>
    </Box>
  )
}

export default Navbar;