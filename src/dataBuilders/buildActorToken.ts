import { settingAutoCalcSize, settingToken } from '../global';
import { ParsedActor, TokenSettings } from '../types/importedActor';
import { getModuleSettings } from '../utils/foundryActions';

export async function buildActorToken(
  parsedData: ParsedActor,
  tokenSettings: TokenSettings,
) {
  var token: any = {};
  token.displayName = parseInt(getModuleSettings(settingToken).displayName);
  token.disposition = tokenSettings.disposition;

  const squares = calculateTokenDimensions(parsedData.size ?? 0);
  if (getModuleSettings(settingAutoCalcSize)) {
    token.width = squares;
    token.height = squares;
    token.scale = calculateScale(parsedData.size ?? 0);
  }

  token.sight = {
    enabled: tokenSettings.vision,
    range: tokenSettings.visionRange,
    angle: tokenSettings.visionAngle,
  };

  return token;
}

function calculateTokenDimensions(size: number) {
  if (size <= 2) {
    return 1;
  }
  if (size >= 3 && size <= 5) {
    return 2;
  }
  if (size >= 6 && size <= 8) {
    return 4;
  }
  if (size >= 9 && size <= 11) {
    return 8;
  }
  if (size >= 12) {
    return 16;
  }
}

function calculateScale(size: number) {
  if (size >= 0) {
    return 1;
  }
  if (size == -1) {
    return 0.85;
  }
  if (size == -2 || size == -3) {
    return 0.75;
  }
  if (size <= -4) {
    return 0.5;
  }
}
