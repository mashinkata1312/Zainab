import fs from 'fs';
import path from 'path';

const filePath = path.resolve('data', 'boostConfig.json');

function ensureFile() {
  if (!fs.existsSync(filePath)) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, '{}');
  }
}

export function getBoostConfig(guildId) {
  ensureFile();
  const data = JSON.parse(fs.readFileSync(filePath));
  return data[guildId] ?? null;
}

export function saveBoostConfig(guildId, config) {
  ensureFile();
  const data = JSON.parse(fs.readFileSync(filePath));
  data[guildId] = config;
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}
