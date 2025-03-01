import React, { useEffect, useRef } from 'react'
import { Flex, Image, Text } from 'rebass'
import styled from 'styled-components'
import Button from 'components/Button'
import LoanStatus from 'components/LoanStatus'
import DebtMenu from 'components/DebtMenu'
import LockMenu from 'components/LockMenu'
import { useMeiCDP, useMeichainBalance } from 'hooks/meichain'
import { usePrice } from 'hooks/price'
import { useMeichainContextState } from 'contexts/MeichainContext'
import refresh from 'images/refresh.svg' 
import { generateNewMnemonic, safeAccess } from 'utils'

import ConnectCosmos from 'images/connect-meichain.svg'

const Card = styled(Flex).attrs(() => ({
  width: '100%',
  height: '100%',
  flexDirection: 'column',
}))`
  background: rgba(249, 251, 252, 0.9);
  box-shadow: 0px 16px 32px rgba(95, 106, 128, 0.1);
  border-radius: 0.56vw;
  position: relative;
`

const useInterval = (callback, delay) => {
  const savedCallback = useRef();

  // Remember the latest function.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay])
}

const LoggedInToMeiChain = ({ meiAddress }) => {
  const [{ data: meichainBalanceData, loading: meichainBalanceLoading, error: meichainBalanceError }, meiAccountBalanceRefetch] = useMeichainBalance(meiAddress)
  const [{ data: cdpData, loading: cdpLoading, error: cdpError }, cdpRefetch] = useMeiCDP(meiAddress)
  const [{ data: priceData, loading: priceLoading, error: priceError }, priceRefetch] = usePrice()

  useInterval(() => {
    meiAccountBalanceRefetch()
    cdpRefetch()
  }, 5000);

  return (
    <Flex flexDirection="column" width="100%" style={{position: "relative"}}>
      <Image src={refresh} width="1vw" style={{position: "absolute", top: "1.5vw", right: "1.5vw", cursor: "pointer"}}
        onClick={() => {
          meiAccountBalanceRefetch()
          cdpRefetch()
          priceRefetch()
        }}
      />
      {meichainBalanceData ? (
        <LoanStatus meiAddress={meiAddress} meichainBalance={meichainBalanceData} />)
        : "loading..."}
      {priceData && cdpData && meichainBalanceData ? (
        <DebtMenu cdp={cdpData} price={safeAccess(priceData, ["cosmos", "usd"])} meichainBalance={meichainBalanceData}/>)
        : "loading..."}
      {priceData && cdpData ? (
        <LockMenu cdp={cdpData} meiAddress={meiAddress} meichainBalance={meichainBalanceData} price={safeAccess(priceData, ["cosmos", "usd"])}/>)
        : "loading..."}
    </Flex>
  )
}

export default ({ meiAddress, setMeiAddress }) => {
  const { getMeichainAddress, setPrivateKeyFromMnemonic } = useMeichainContextState()
  return (
    <Card>
      {meiAddress ? (
        <LoggedInToMeiChain meiAddress={meiAddress}/>
      ) : (
        <Flex
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          width="100%"
          height="100%"
          p="1.8vw"
        >
          <Image src={ConnectCosmos} width="23vw" />
          <Button
            py="0.55vw"
            px="1vw"
            mt="1.5vw"
            background="#971e44"
            boxShadow="0px 4px 8px rgba(151, 30, 68, 0.25)"
            onClick={() => {
              try {
                const mnemonic = generateNewMnemonic()
                alert(mnemonic)
              } catch (error) {
                console.error(`Fail to Generate Mnemomic: ${error}`)
                alert("Fail to Generate Mnemomic")
              }
            }}
          >
            <Text fontSize="0.83vw" fontWeight={500} lineHeight="1vw">
              Generate Mnemonic
            </Text>
          </Button>
          <Button
            py="0.55vw"
            px="1vw"
            mt="2.22vw"
            background="#971e44"
            boxShadow="0px 4px 8px rgba(151, 30, 68, 0.25)"
            onClick={() => {
              const mnemonic = window.prompt('Insert MeiChain address mnemonic')
              if (mnemonic) {
                try {
                  const meichainAddress = getMeichainAddress(mnemonic)
                  setPrivateKeyFromMnemonic(mnemonic)
                  setMeiAddress(meichainAddress)
                } catch (error) {
                  alert("Invalid mnemonic. Cannot get account from mnemonic.")
                }
              }
            }}
          >
            <Text fontSize="0.83vw" fontWeight={500} lineHeight="1vw">
              Connect To MeiChain
            </Text>
          </Button>
        </Flex>
      )}
    </Card>
  )
}
