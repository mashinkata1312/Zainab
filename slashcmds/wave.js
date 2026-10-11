// commands/wave.js
import {
  SlashCommandBuilder,
  MessageFlags
} from 'discord.js';

import {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  MediaGalleryBuilder
} from '@discordjs/builders';

import fetch from 'node-fetch';
import fs from 'fs';

const statsFile = './data/waveStats.json';

export default {
  data: new SlashCommandBuilder()
    .setName('wave')
    .setDescription('Wave hello to someone!')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The person you want to wave at')
        .setRequired(true)
    ),

  async execute(interaction) {
    const giver = interaction.user;
    const receiver = interaction.options.getUser('user');

    if (receiver.id === giver.id) {
      return interaction.reply({
        content: "You can't wave at yourself, but here's a friendly wave anyway! 👋",
        flags: MessageFlags.Ephemeral
      });
    }

    // Fetch wave image from nekos.best
    let waveUrl;
    try {
      const res = await fetch('https://nekos.best/api/v2/wave');
      const data = await res.json();
      waveUrl = data.results[0].url;
    } catch (err) {
      console.error('Failed to fetch wave image:', err);
      return interaction.reply({
        content: 'Could not fetch a wave image right now. Please try again later.',
        flags: MessageFlags.Ephemeral
      });
    }

    // Ensure data directory exists
    if (!fs.existsSync('./data')) fs.mkdirSync('./data');

    // Load or initialize stats JSON
    let stats = {};
    if (fs.existsSync(statsFile)) {
      stats = JSON.parse(fs.readFileSync(statsFile, 'utf8'));
    }
    if (!stats[giver.id]) stats[giver.id] = { given: 0, received: 0 };
    if (!stats[receiver.id]) stats[receiver.id] = { given: 0, received: 0 };

    stats[giver.id].given++;
    stats[receiver.id].received++;

    fs.writeFileSync(statsFile, JSON.stringify(stats, null, 2));

    // Build container components
    const container = new ContainerBuilder()
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `${giver.username} waves at ${receiver.username} \n\n` +
          `${giver.username} has waved **${stats[giver.id].given}** times.\n` +
          `${receiver.username} has been waved at **${stats[receiver.id].received}** times.`
        )
      )
      .addSeparatorComponents()
      .addMediaGalleryComponents(
        new MediaGalleryBuilder().addItems(item => item.setURL(waveUrl))
      );

    await interaction.reply({
      components: [container],
      flags: MessageFlags.IsComponentsV2
    });
  }
};

