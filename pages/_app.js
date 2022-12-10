import React, { useState } from 'react';
import { ChakraProvider } from '@chakra-ui/react';

import Navbar from '../components/Navbar';

function MyApp({ Component, pageProps }) {
  const [ethAddress, setETHAddress] = useState('');
  const [userSigner, setUserSigner] = useState(null);
  const [dcContract, setDCContract] = useState(null);
  const [tokenName, setTokenName] = useState("");

  return (
    <ChakraProvider>
      <Navbar
        ethAddress={ethAddress}
        tokenName={tokenName}
        setETHAddress={setETHAddress}
        setUserSigner={setUserSigner}
        setDCContract={setDCContract}
        setTokenName={setTokenName} />
      <Component
        {...pageProps}
        tokenName={tokenName}
        ethAddress={ethAddress}
        userSigner={userSigner}
        dcContract={dcContract} />
    </ChakraProvider>
  )
}

export default MyApp;
