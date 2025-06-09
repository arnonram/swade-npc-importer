export function foundryI18nLocalize(localizationKey: string): string {
  if (!game || !game.i18n) {
    throw new Error('Foundry i18n is not available');
  }
  return game.i18n.localize(localizationKey);
}

export function foundryI18nFormat(
  stringToFormat: string,
  data?: Record<string, string>,
): string {
  if (!game || !game.i18n) {
    throw new Error('Foundry i18n is not available');
  }
  return game.i18n.format(stringToFormat, data);
}

export function foundryUiInfo(infoString: string): void {
  if (!ui || !ui.notifications) {
    throw new Error('Foundry UI notifications are not available');
  }
  ui.notifications.info(infoString);
}

export function foundryUiError(errorString: string): void {
  if (!ui || !ui.notifications) {
    throw new Error('Foundry UI notifications are not available');
  }
  ui.notifications.error(errorString);
}
