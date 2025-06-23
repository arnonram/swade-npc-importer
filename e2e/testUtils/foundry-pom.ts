import { Page } from '@playwright/test';
import { ActoryType, Disposition, Languages, users } from './enums';
import fs from 'fs';

const inputPath = `${__dirname}/../testData/input/`;

export class FoundryApp {
  readonly page: Page;
  saveFolder = 'Test Folder';

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('http://localhost:30000');
  }

  async login(user: users) {
    await this.goto();
    await this.page.locator('[name="userid"]').selectOption(user);
    await this.page.locator('[name=join]').click();
    // await this.page.locator('button:has-text("Ok")').click();
  }

  async gotoActorsTab() {
    await this.page.getByRole('tab', { name: 'Actors' }).click();
  }

  async gotoSettingsTab() {
    await this.page.getByLabel('Game Settings').click();
  }

  async deleteActor(actorName: string) {
    await this.page.getByTitle(actorName).click({
      button: 'right',
    });
    await this.page.locator('text=Delete').click();
    await this.page.locator('button:has-text("Yes")').click();
  }

  async setNpcImporterSettings(language: Languages) {
    await this.gotoSettingsTab();
    await this.page.waitForTimeout(1000);
    await this.page
      .getByRole('button', { name: 'Configure Settings', exact: false })
      .click();
    await this.page
      .locator('[aria-label="PACKAGECONFIG.NavLabel"]')
      .getByText('SWADE Stat Block Importer')
      .click();
    await this.page
      .locator('[name="swade-npc-importer.parseLanguage"]')
      .selectOption(language);
    // await this.page.getByRole('checkbox', {name: "swade-npc-importer.renderSheet"}).uncheck()
    await this.page.getByRole('button', { name: 'Save Changes' }).click();
  }

  async createFolder() {
    await this.gotoActorsTab();
    await this.page.locator('#actors >> text=Create Folder').click();
    await this.page.locator('[name=name]').type(this.saveFolder);
    await this.page.keyboard.press('Enter');
    await this.toggleFolderState();
  }

  async toggleFolderState() {
    await this.page.locator(`text="Test Folder"`).click({ force: true });
  }

  async deleteFolder() {
    await this.gotoActorsTab();
    await this.page
      .locator(`text="Test Folder"`)
      .click({ button: 'right', force: true });
    await this.page.locator(`text="Delete All"`).click();
    await this.page.locator('button[data-button=yes]').click();
  }

  async openImporter() {
    await this.gotoActorsTab();
    await this.page.locator('button:has-text("Stat Block Importer")').click();
  }

  async importActor(actorName: string) {
    await this.page.locator('textarea[name="statBlock"]').click();
    await this.page
      .locator('textarea[name="statBlock"]')
      .fill(fs.readFileSync(`${inputPath}${actorName}.txt`, 'utf-8'));
    await this.page.locator('text=Import!').click();
  }

  async exportActor(actorName: string): Promise<string | null> {
    await this.page.locator(`h4:has-text("${actorName}")`).first().click({
      button: 'right',
    });
    const [download] = await Promise.all([
      this.page.waitForEvent('download'),
      this.page.locator('text=Export Data').click(),
    ]);
    return download.path();
  }

  async selectActorType(actorType: ActoryType) {
    await this.page.locator(`#${actorType}`).check();
  }

  async selectIsWildCard(isWildCard: boolean = false) {
    await this.page.locator(`#${isWildCard ? 'yes' : 'no'}`).check();
  }

  async selectDisposition(disposition: Disposition) {
    await this.page.locator(`#${disposition}`).check();
  }

  async updateVision(hasVision: boolean = false, visionRange: number = 0) {
    if (hasVision) {
      await this.page.locator('input[name="vision"]').check();
    }
    await this.page
      .locator('input[name="visionRange"]')
      .fill(visionRange.toString());
  }

  async setSaveFolder() {
    await this.page.locator('[name="save-folder"]').type(this.saveFolder);
    await this.page.keyboard.press('Enter');
  }
}
