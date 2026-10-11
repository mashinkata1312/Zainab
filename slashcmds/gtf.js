import {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} from 'discord.js';
import fs from 'fs';
import path from 'path';

// Load country list, excluding Israel
const countries = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'data', 'countries.json')));
const filteredCountries = countries.filter(c => c.code.toLowerCase() !== 'il');

export default {
  data: new SlashCommandBuilder()
    .setName('gtf')
    .setDescription('Guess the flag!'),

  async execute(interaction, client) {
    // Pick a random country
    const random = filteredCountries[Math.floor(Math.random() * filteredCountries.length)];
    const countryCode = random.code.toLowerCase();
    const countryName = random.name;

    // Store game state in client.tempData (keyed by user id)
    const gameKey = `gtf_${interaction.user.id}`;
    client.tempData.set(gameKey, {
      correct: countryName,
      countryCode,
      streak: client.tempData.get(gameKey)?.streak || 0,
      guildId: interaction.guildId,
    });

    // Create embed with flag
    const embed = new EmbedBuilder()
      .setTitle('🌍 Guess the Flag!')
      .setImage(`https://flagcdn.com/w320/${countryCode}.png`)
      .setColor('Blue');

    // Create answer button
    const buttons = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('gtf_answer_submit')
        .setLabel('Answer')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('gtf_hint')
        .setLabel('Hint')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('gtf_skip')
        .setLabel('Skip')
        .setStyle(ButtonStyle.Danger)
    );

    await interaction.reply({
      embeds: [embed],
      components: [buttons],
      ephemeral: true,
    });
  },
};
