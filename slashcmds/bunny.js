
import {
  SlashCommandBuilder,
  MessageFlags
} from 'discord.js';

import {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  MediaGalleryBuilder,
} from '@discordjs/builders';

import fetch from 'node-fetch';

export default {
  data: new SlashCommandBuilder()
    .setName('bunny')
    .setDescription('Shows a bnnuy'),

  async execute(interaction) {
    const bunnyUrl = await getBunnyImage();

    const container = new ContainerBuilder()
      
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent('Here’s your bunny !! Many thanks to the Chewey Bots API!!! <3')
      )
      .addSeparatorComponents(new SeparatorBuilder())
      .addMediaGalleryComponents(
        new MediaGalleryBuilder().addItems(item => item.setURL(bunnyUrl))
      );

    await interaction.reply({
      components: [container],
      flags: MessageFlags.IsComponentsV2
    });
  }
};

// helper to fetch from Chewey API
async function getBunnyImage() {
  const res = await fetch('https://api.chewey-bot.top/rabbit?auth=d1b7bfa2-b0af-4590-9b91-829d408c22d3');
  const data = await res.json();
  return data.data || 'https://placekitten.com/400/400'; // fallback
}
