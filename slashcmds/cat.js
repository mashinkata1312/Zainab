// cat.js
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

export default {
  data: new SlashCommandBuilder()
    .setName('cat')
    .setDescription('meow'),

  async execute(interaction) {
    const catUrl = await getCatImage();

    const container = new ContainerBuilder()
      
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent('this is a cat ayaya speaking of cats you should stream Hands Up by MEOVV')
      )
      .addSeparatorComponents()
      .addMediaGalleryComponents(
        new MediaGalleryBuilder().addItems(item => item.setURL(catUrl))
      );

    await interaction.reply({
      components: [container],
      flags: MessageFlags.IsComponentsV2
    });
  }
};

// helper to fetch a cat image
async function getCatImage() {
  const res = await fetch('https://api.thecatapi.com/v1/images/search', {
    headers: {
      'x-api-key': 'live_d5lPsRm1doMCpDaUpFDHA5iwXMkMw2YCIefclbn74WoUJ4pQYBLCiErbKGMahCW'
    }
  });
  const data = await res.json();
  return data[0]?.url || 'https://cataas.com/cat';
}
