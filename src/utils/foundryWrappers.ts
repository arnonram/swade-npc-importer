export function foundryI18nLocalize(localizationKey: string): string {
  return game.i18n?.localize(localizationKey) ?? '';
}

export function foundryI18nFormat(
  stringToFormat: string,
  data?: Record<string, string>,
): string {
  return game.i18n?.format(stringToFormat, data) ?? '';
}

export function foundryUiInfo(infoString: string): void {
  ui.notifications?.info(infoString);
}

export function foundryUiError(errorString: string): void {
  ui.notifications?.error(errorString);
}
