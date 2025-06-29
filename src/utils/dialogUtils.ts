/**
 * Returns 'checked' if setValue equals htmlValue, otherwise returns an empty string.
 */
export function isChecked(setValue: any, htmlValue: any): string {
  return setValue == htmlValue ? 'checked' : '';
}

/**
 * Returns 'selected' if lastFolder equals folderName, otherwise returns an empty string.
 */
export function isLastSavedFolder(lastFolder: any, folderName: any): string {
  return lastFolder != undefined && lastFolder === folderName ? 'selected' : '';
}

/**
 * Builds the HTML for folder options in the select dropdown.
 */
export function buildFolderOptions(lastSave: any, folders: string[]): string {
  let folderOptions = `<option value='' ${isLastSavedFolder(lastSave, '')}>--</option>`;
  folders.forEach(folder => {
    folderOptions += `<option value="${folder.trim()}" ${isLastSavedFolder(lastSave, folder.trim())}>${folder.trim()}</option>`;
  });
  return folderOptions;
}
