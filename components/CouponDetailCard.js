import React from 'react';
import dynamic from 'next/dynamic';
import { SimpleGrid, Image, Heading, Divider, Spinner, Button, Text } from '@chakra-ui/react';

import { getDate } from '../utils/date';
import { formatAddress } from '../utils/formatAddress';

function CouponDetailCard({ tokenName, coupon, address, buyLoading, buyProduct, buyProductWithReferrer, setWorldcoinData }) {
  return (
    <SimpleGrid minChildWidth='300px' columns={[4]} spacing={10} mb='5'>
      <Image src={coupon.cid + "/" + coupon?.couponData?.photoName} alt='Product' bg='#fff7e6' h='400' w='full' style={{ objectFit: 'contain' }} />
      <div>
        <Heading fontSize='2xl'>{coupon?.couponData?.title}</Heading>
        <Text mb='3'>{coupon?.couponData?.description}</Text>
        <p>Expire in {getDate(coupon?.expireDate?.toString())}</p>
        <p>From {formatAddress(coupon.owner)}</p>
        <p>Price: {coupon?.price?.toString() / 10 ** 18} {tokenName}</p>

        {buyLoading
            ? <Spinner color='orange' mt='4' />
            :  <Button colorScheme='orange' onClick={buyProduct} mt='3'>
                Buy it
              </Button>
          }

        {/* {address !== "0" && <>
          <Divider mt='4' mb='5' />

          <Button colorScheme='orange' onClick={buyProductWithReferrer} mt='3'>
            Buy it with Referrer
          </Button>
        </>} */}
        {/* <Divider mt='4' mb='2' />
        <Button colorScheme='orange' onClick={buyProductWithReferrer} mt='3'>
          Buy it with Referrer
        </Button> */}
      </div>
    </SimpleGrid>
  )
}

export default CouponDetailCard;