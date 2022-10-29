import { settingAutoCalcSize, settingToken } from '../global.js';
import { getModuleSettings } from '../utils/foundryActions.js';

export async function buildActorToken(parsedData, tokenSettings) {
  var token = {};
  token.displayName = parseInt(getModuleSettings(settingToken).displayName);
  token.disposition = tokenSettings.disposition;
  const squares = GetWidthHight(parsedData.Size);

  if (getModuleSettings(settingAutoCalcSize)) {
    token.width = squares;
    token.height = squares;
    token.scale = CalculateScale(parsedData.Size);
  }
  token.sight = {
    enabled: tokenSettings.vision,
    range: tokenSettings.visionRange,
    angle: tokenSettings.visionAngle,
  };
  return token;
}

function GetWidthHight(size) {
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

function CalculateScale(size) {
  if (size >= 0) {
    return 1;
  }
  if (size == -1) {
    return 0.85;
  }
  if (size == -2 || size == -3) {
    return 0.75;
  }
  if (size == -4) {
    return 0.5;
  }
}
