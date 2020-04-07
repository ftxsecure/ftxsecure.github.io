import { useState, useEffect } from 'react'
import { Button, ButtonGroup, Stack, Text, Box } from '@chakra-ui/core'
import { Web3Provider } from '@ethersproject/providers'
import { useWeb3React } from '@web3-react/core'

import { formatEtherscanLink, EtherscanType, shortenAddress } from '../utils'
import { injected } from '../connectors'
import { useETHBalance, useTokenBalance } from '../data'
import TokenLogo, { TokenLogoColor } from './TokenLogo'
import { WETH } from '@uniswap/sdk'

export default function Account({ firstToken, secondToken }) {
  const { active, error, activate, library, chainId, account } = useWeb3React<Web3Provider>()

  const [connecting, setConnecting] = useState(false)
  useEffect(() => {
    if (active || error) {
      setConnecting(false)
    }
  }, [active, error])

  const [ENSName, setENSName] = useState<string>('')
  useEffect(() => {
    if (library && account) {
      library
        .lookupAddress(account)
        .then((name) => {
          if (typeof name === 'string') {
            setENSName(name)
          }
        })
        .catch(() => {})
      return () => {
        setENSName('')
      }
    }
  }, [library, account, chainId])

  const { data: ETHBalance } = useETHBalance(account)
  const { data: firstTokenBalance } = useTokenBalance(firstToken, account)
  const { data: secondTokenBalance } = useTokenBalance(secondToken, account)

  if (typeof account !== 'string') {
    return (
      <Box>
        <Button
          isLoading={connecting}
          onClick={() => {
            setConnecting(true)
            activate(injected)
          }}
        >
          Connect Wallet
        </Button>
      </Box>
    )
  }

  return (
    <Stack direction="column" align="flex-end">
      <Stack direction="row" spacing={0} whiteSpace="nowrap" m={0}>
        <Button
          variant="outline"
          isDisabled
          isLoading={!!!ETHBalance}
          _disabled={{
            opacity: 1,
            cursor: 'default',
          }}
          _hover={{}}
          style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0, borderRight: 'none' }}
        >
          Ξ {ETHBalance?.toSignificant(4, { groupSeparator: ',' })}
        </Button>

        <Button
          as="a"
          rightIcon="external-link"
          style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
          {...{
            href: formatEtherscanLink(EtherscanType.Account, [chainId, account]),
            target: '_blank',
            rel: 'noopener noreferrer',
          }}
        >
          {ENSName || `${shortenAddress(account, 4)}`}
        </Button>
      </Stack>

      {!!firstToken && !firstToken.equals(WETH[firstToken.chainId]) && (
        <Button
          as="a"
          rightIcon="external-link"
          variant="outline"
          width="min-content"
          isLoading={!!!firstTokenBalance}
          {...{
            href: formatEtherscanLink(EtherscanType.TokenBalance, [firstToken, account]),
            target: '_blank',
            rel: 'noopener noreferrer',
          }}
        >
          <TokenLogo token={firstToken} size="1.5rem" />
          <Text ml="0.5rem">{firstTokenBalance?.toSignificant(6, { groupSeparator: ',' })}</Text>
        </Button>
      )}

      {!!secondToken && !secondToken.equals(WETH[secondToken.chainId]) && (
        <Button
          as="a"
          rightIcon="external-link"
          variant="outline"
          width="min-content"
          isLoading={!!!secondTokenBalance}
          {...{
            href: formatEtherscanLink(EtherscanType.TokenBalance, [secondToken, account]),
            target: '_blank',
            rel: 'noopener noreferrer',
          }}
        >
          <TokenLogo token={secondToken} size="1.5rem" />
          <Text ml="0.5rem">{secondTokenBalance?.toSignificant(6, { groupSeparator: ',' })}</Text>
        </Button>
      )}
    </Stack>
  )
}