import { settingAutoCalcSize, settingToken } from '../global.js';
import { getModuleSettings } from '../utils/foundryActions.js';

export const buildActorToken = async function (parsedData, tokenSettings) {
  var token = tokenSettings;
  const squares = GetWidthHight(parsedData.Size);
  token.displayName = parseInt(getModuleSettings(settingToken).displayName);
  if (getModuleSettings(settingAutoCalcSize)) {
    token.width = squares;
    token.height = squares;
    token.scale = CalculateScale(parsedData.Size);
  }
  return token;
};

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
