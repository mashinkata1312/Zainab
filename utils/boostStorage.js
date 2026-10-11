
import fs from 'fs';
import path from 'path';

const filePath = path.resolve('data', 'boostConfig.json');

function ensureFile() {
  if (!fs.existsSync(filePath)) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, '{}');
  }
}

export function getBoostMessageConfig(guildId) {
  ensureFile();
  const raw = fs.readFileSync(filePath);
  const data = JSON.parse(raw);
  return data[guildId] || null;
}

export function setBoostMessageConfig(guildId, config) {
  ensureFile();
  const raw = fs.readFileSync(filePath);
  const data = JSON.parse(raw);
  data[guildId] = config;
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}
