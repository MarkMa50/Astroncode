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

type MascotFrame = {
  top: string
  face: string
  base: string
}

const FRAMES: Record<ClawdPose, MascotFrame> = {
  default: {
    top: ' .----------. ',
    face: ' |  o    o  | ',
    base: " '---[__]---' ",
  },
  'look-left': {
    top: ' .----------. ',
    face: ' | o     o  | ',
    base: " '---[__]---' ",
  },
  'look-right': {
    top: ' .----------. ',
    face: ' |  o     o | ',
    base: " '---[__]---' ",
  },
  'arms-up': {
    top: ' /----------\\ ',
    face: ' |  o    o  | ',
    base: " '---[__]---' ",
  },
}

export function Clawd({ pose = 'default' }: Props = {}): React.ReactNode {
  const frame = FRAMES[pose]

  return (
    <Box flexDirection="column" alignItems="center">
      <Text color="clawd_body">{frame.top}</Text>
      <Text color="clawd_body">{frame.face}</Text>
      <Text color="clawd_body">{frame.base}</Text>
    </Box>
  )
}
