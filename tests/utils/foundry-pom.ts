import { Page } from '@playwright/test';
import { Languages } from './languages';
import fs from 'fs';

const inputPath = `${__dirname}/../testData/input/`;

export class FoundryApp {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('http://localhost:30000');
  }

  async login() {
    await this.goto();
    await this.page.locator('select[name="userid"]').click();
    await this.page.keyboard.press('ArrowDown');
    await this.page.keyboard.press('Enter');
    await this.page.locator('button:has-text("Join Game Session")').click();
    await this.page.locator('button:has-text("Ok")').click();
  }

  async deleteActor(actorName: string) {
    await this.page.locator(`h4:has-text("${actorName}")`).click({
      button: 'right',
    });
    await this.page.locator('text=Delete').click();
    await this.page.locator('button:has-text("Yes")').click();
  }

  async setLanguage(language: Languages) {
    await this.page.locator('.fas.fa-cogs').first().click();
    await this.page.locator('text=Configure Settings').click();
    await this.page.locator('text=Module Settings').click();
    await this.page
      .locator('select[name="swade-npc-importer\\.parseLanguage"]')
      .selectOption(language);
    await this.page.locator('text=Save Changes').click();
  }

  async importActor(actorName: string) {
    await this.page.locator('a:nth-child(4) .fas').first().click();
    await this.page.locator('button:has-text("Actor Importer")').click();
    await this.page.locator('textarea[name="statBlock"]').click();
    await this.page
      .locator('textarea[name="statBlock"]')
      .fill(fs.readFileSync(`${inputPath}${actorName}.txt`, 'utf-8'));
    await this.page.locator('text=Import!').click();
  }

  async exportActor(actorName: string): Promise<string | null> {
    await this.page.locator(`h4:has-text("${actorName}")`).click({
      button: 'right',
    });
    const [download] = await Promise.all([
      this.page.waitForEvent('download'),
      this.page.locator('text=Export Data').click(),
    ]);
    return download.path();
  }
}
