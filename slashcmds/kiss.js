// commands/kiss.js
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

const statsFile = './data/kissStats.json';

export default {
  data: new SlashCommandBuilder()
    .setName('kiss')
    .setDescription('Send someone a sweet kiss')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The person you want to kiss')
        .setRequired(true)
    ),

  async execute(interaction) {
    const giver = interaction.user;
    const receiver = interaction.options.getUser('user');

    if (receiver.id === giver.id) {
      return interaction.reply({
        content: "You can't kiss yourself... but here's a kiss for you anyway 😘",
        flags: MessageFlags.Ephemeral
      });
    }

    // Fetch kiss image from nekos.best
    let kissUrl;
    try {
      const res = await fetch('https://nekos.best/api/v2/kiss');
      const data = await res.json();
      kissUrl = data.results[0].url;
    } catch (err) {
      console.error('Failed to fetch kiss image:', err);
      return interaction.reply({
        content: 'Could not fetch a kiss image right now. Please try again later.',
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
          `${giver.username} kisses ${receiver.username} \n\n` +
          `${giver.username} has given **${stats[giver.id].given}** kisses.\n` +
          `${receiver.username} has received **${stats[receiver.id].received}** kisses.`
        )
      )
      .addSeparatorComponents()
      .addMediaGalleryComponents(
        new MediaGalleryBuilder().addItems(item => item.setURL(kissUrl))
      );

    await interaction.reply({
      components: [container],
      flags: MessageFlags.IsComponentsV2
    });
  }
};

