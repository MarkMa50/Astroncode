import * as React from 'react'
import { Box, Text } from '../../ink.js'

export type ClawdPose =
  | 'default'
  | 'arms-up'
  | 'look-left'
  | 'look-right'

type Props = {
  pose?: ClawdPose
}

// Compact Astroncode terminal mascot used in condensed layouts.
const MASCOT_FRAMES: Record<ClawdPose, string[]> = {
  default: [
    '      ██████████      ',
    '    ██  ◉    ◉  ██    ',
    '    ██    ▄▄    ██    ',
    '    ██  ASTRON  ██    ',
    '    ██▄▄▄▄▄▄▄▄▄▄██    ',
    '       ███  ███       ',
  ],
  'look-left': [
    '      ██████████      ',
    '    ██ ◉      ◉ ██    ',
    '    ██    ▄▄    ██    ',
    '    ██  ASTRON  ██    ',
    '    ██▄▄▄▄▄▄▄▄▄▄██    ',
    '       ███  ███       ',
  ],
  'look-right': [
    '      ██████████      ',
    '    ██  ◉      ◉██    ',
    '    ██    ▄▄    ██    ',
    '    ██  ASTRON  ██    ',
    '    ██▄▄▄▄▄▄▄▄▄▄██    ',
    '       ███  ███       ',
  ],
  'arms-up': [
    '    \\  ████████  /    ',
    '     \\█ ◉    ◉ █/     ',
    '      █   ▄▄   █      ',
    '      █ ASTRON █      ',
    '      █▄▄▄▄▄▄▄▄█      ',
    '       ██    ██       ',
  ],
}

export function Clawd({ pose = 'default' }: Props = {}): React.ReactNode {
  const frame = MASCOT_FRAMES[pose]

  return (
    <Box flexDirection="column" alignItems="center">
      {frame.map((line, i) => (
        <Text key={i} color="astron" bold={i === 0 || i === frame.length - 1}>
          {line}
        </Text>
      ))}
    </Box>
  )
}
