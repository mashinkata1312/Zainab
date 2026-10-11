import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const filePath = path.join(__dirname, '../data/starboardSettings.json');

export function getSettings(guildId) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const data = JSON.parse(raw);
  return data[guildId] || null;
}

export function saveSettings(guildId, settings) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const data = JSON.parse(raw);
  data[guildId] = settings;
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}
