import { c as _c } from "react/compiler-runtime";
import React from 'react';
import { Box, Text } from 'src/ink.js';
import { env } from '../../utils/env.js';

const WELCOME_V2_WIDTH = 44;

const WORDMARK_LINES = [
  '╔═╗╔═╗╔╦╗╦═╗╔═╗╔╗╔',
  '╠═╣╚═╗ ║ ╠╦╝║ ║║║║',
  '╩ ╩╚═╝ ╩ ╩╚═╚═╝╝╚╝',
  '     ╔═╗╔═╗╔╦╗╔═╗',
  '     ║  ║ ║ ║║║╣ ',
  '     ╚═╝╚═╝═╩╝╚═╝',
];

export function WelcomeV2() {
  const $ = _c(35);
  if (env.terminal === "Apple_Terminal") {
    return <AppleTerminalWelcomeV2 />;
  }

  return (
    <Box width={WELCOME_V2_WIDTH} flexDirection="column" alignItems="center">
      {WORDMARK_LINES.map((line, i) => (
        <Text key={i} color={i < 3 ? "astron" : i === 3 ? "astronShimmer" : "clawd_body"} bold>{line}</Text>
      ))}
    </Box>
  );
}

function AppleTerminalWelcomeV2() {
  return (
    <Box width={WELCOME_V2_WIDTH} flexDirection="column" alignItems="center">
      {WORDMARK_LINES.map((line, i) => (
        <Text key={i} color={i < 3 ? "astron" : i === 3 ? "astronShimmer" : "clawd_body"} bold>{line}</Text>
      ))}
    </Box>
  );
}
