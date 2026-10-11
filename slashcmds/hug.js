// commands/hug.js
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

const statsFile = './data/hugStats.json';

export default {
  data: new SlashCommandBuilder()
    .setName('hug')
    .setDescription('Give someone a wholesome anime hug')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The person you want to hug')
        .setRequired(true)
    ),

  async execute(interaction) {
    const giver = interaction.user;
    const receiver = interaction.options.getUser('user');

    if (receiver.id === giver.id) {
      return interaction.reply({
        content: "You can't hug yourself... but here's a virtual hug anyway 🤗",
        flags: MessageFlags.Ephemeral
      });
    }

    // Fetch hug image from nekos.best
    let hugUrl;
    try {
      const res = await fetch('https://nekos.best/api/v2/hug');
      const data = await res.json();
      hugUrl = data.results[0].url;
    } catch (err) {
      console.error('Failed to fetch hug image:', err);
      return interaction.reply({
        content: 'Could not fetch a hug image right now. Please try again later.',
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

    // Build container components just like in cat.js
    const container = new ContainerBuilder()
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `${giver.username} gives ${receiver.username} a warm hug!\n\n` +
          `${giver.username} has given **${stats[giver.id].given}** hugs.\n` +
          `${receiver.username} has received **${stats[receiver.id].received}** hugs.`
        )
      )
      .addSeparatorComponents()
      .addMediaGalleryComponents(
        new MediaGalleryBuilder().addItems(item => item.setURL(hugUrl))
      );

    await interaction.reply({
      components: [container],
      flags: MessageFlags.IsComponentsV2
    });
  }
};

