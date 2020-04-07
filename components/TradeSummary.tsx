import { useState } from 'react'
import {
  Stack,
  Stat,
  useColorMode,
  StatLabel,
  StatNumber,
  StatHelpText,
  IconButton,
  Icon,
  StatArrow,
} from '@chakra-ui/core'
import { Route, Trade } from '@uniswap/sdk'

import { getTokenDisplayValue, getPercentChange } from '../utils'
import { useWindowSize } from '../hooks'

export default function TradeSummary({
  route,
  trade,
  warning,
  danger,
}: {
  route?: Route
  trade?: Trade
  warning: boolean
  danger: boolean
}) {
  const { colorMode } = useColorMode()

  const size = useWindowSize()
  const isVertical = size?.height > size?.width

  const [invert, setInvert] = useState(false)

  const path = !!!route ? [] : (invert ? route.path : route.path.slice().reverse()).map(getTokenDisplayValue)

  return (
    <Stack direction={isVertical ? 'column' : 'row'} align="center" spacing="1rem">
      <Stat
        p="1rem"
        backgroundColor={colorMode === 'light' ? 'gray.100' : 'rgba(255,255,255,0.04)'}
        borderRadius="0.25rem"
      >
        <IconButton
          position="absolute"
          top={0}
          right={0}
          icon="view"
          variant="ghost"
          size="sm"
          aria-label="Invert"
          onClick={() => setInvert((invert) => !invert)}
        />

        <StatLabel w="max-content" pr="2rem">
          Mid Price
        </StatLabel>

        <StatNumber w="max-content">
          {!!!route
            ? '0.0'
            : invert
            ? route.midPrice.invert().toSignificant(4, { groupSeparator: ',' })
            : route.midPrice.toSignificant(4, { groupSeparator: ',' })}
        </StatNumber>
        <StatHelpText w="max-content" m={0} height="initial">
          {path.length === 0 ? '‎' : path.slice(0, route.path.length - 1).join(' / ')}
          {path.length === 0 ? '‎' : ` / 1 ${path.slice(-1)}`}
        </StatHelpText>
      </Stat>

      {!!trade && (
        <Stack direction={isVertical ? 'column' : 'row'} align="center" spacing="1rem">
          <Icon name={isVertical ? 'chevron-down' : 'chevron-right'} size="3rem" />

          <Stat
            p="1rem"
            backgroundColor={colorMode === 'light' ? 'gray.100' : 'rgba(255,255,255,0.04)'}
            borderRadius="0.25rem"
          >
            <StatLabel w="max-content">Fill Price</StatLabel>
            <StatNumber w="max-content">
              {invert
                ? trade.executionPrice.invert().toSignificant(4, { groupSeparator: ',' })
                : trade.executionPrice.toSignificant(4, { groupSeparator: ',' })}
            </StatNumber>
            <StatHelpText w="max-content" m={0} opacity={warning ? 1 : 0.8}>
              <StatArrow
                type={invert ? 'increase' : 'decrease'}
                {...(warning && {
                  size: '1.125rem',
                  name: !danger ? 'warning-2' : 'not-allowed',
                  color: colorMode === 'light' ? 'yellow.500' : 'yellow.200',
                })}
              />
              {getPercentChange(
                invert ? trade.route.midPrice.invert() : trade.route.midPrice,
                invert ? trade.executionPrice.invert() : trade.executionPrice,
                invert
              ).toSignificant(3, { groupSeparator: ',' })}
              %
            </StatHelpText>
          </Stat>

          <Icon name={isVertical ? 'chevron-down' : 'chevron-right'} size="3rem" />

          <Stat
            p="1rem"
            backgroundColor={colorMode === 'light' ? 'gray.100' : 'rgba(255,255,255,0.04)'}
            borderRadius="0.25rem"
          >
            <StatLabel w="max-content">Mid Price</StatLabel>
            <StatNumber w="max-content">
              {invert
                ? trade.nextMidPrice.invert().toSignificant(4, { groupSeparator: ',' })
                : trade.nextMidPrice.toSignificant(4, { groupSeparator: ',' })}
            </StatNumber>
            <StatHelpText w="max-content" m={0}>
              <StatArrow type={invert ? 'increase' : 'decrease'} />
              {getPercentChange(
                invert ? trade.route.midPrice.invert() : trade.route.midPrice,
                invert ? trade.nextMidPrice.invert() : trade.nextMidPrice,
                invert
              ).toSignificant(3, { groupSeparator: ',' })}
              %
            </StatHelpText>
          </Stat>
        </Stack>
      )}
    </Stack>
  )
}