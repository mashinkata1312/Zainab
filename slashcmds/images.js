// cat and bunny excluded here but not in main bunny file 
// commands/images.js
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

const GROUPS = {
  animals: [
    'birb','crab','dog','dolphin','duck','ferret','fish','fox','hedgehog',
    'jellyfish','kangaroo','koala','otter','owl','panda','penguin','rabbit',
    'raccoon','red-panda','snake','turtle','whale','wolf',  'capybara', 'seal'
  ],
  nature: ['fantasy-art','nature','space'],
  misc: ['random','car','plane']
};

export default {
  data: (() => {
    const builder = new SlashCommandBuilder()
      .setName('images')
      .setDescription('Get random images from Chewey API');

    // Animals group
    builder.addSubcommandGroup(group => {
      group.setName('animals').setDescription('Animal images');
      for (const ep of GROUPS.animals) {
        group.addSubcommand(sub =>
          sub.setName(ep.replace(/-/g, ''))
            .setDescription(`Get a ${ep.replace('-', ' ')} image`)
        );
      }
      return group;
    });

    // Nature group
    builder.addSubcommandGroup(group => {
      group.setName('nature').setDescription('Nature & space images');
      for (const ep of GROUPS.nature) {
        group.addSubcommand(sub =>
          sub.setName(ep.replace(/-/g, ''))
            .setDescription(`Get a ${ep.replace('-', ' ')} image`)
        );
      }
      return group;
    });

    // Misc group
    builder.addSubcommandGroup(group => {
      group.setName('misc').setDescription('Miscellaneous images');
      for (const ep of GROUPS.misc) {
        group.addSubcommand(sub =>
          sub.setName(ep.replace(/-/g, ''))
            .setDescription(`Get a ${ep.replace('-', ' ')} image`)
        );
      }
      return group;
    });

    return builder;
  })(),

  async execute(interaction) {
    const group = interaction.options.getSubcommandGroup();
    const sub = interaction.options.getSubcommand();

    const endpoint = GROUPS[group].find(ep => ep.replace(/-/g, '') === sub);
    const imageUrl = await fetchFromChewey(endpoint);

    const container = new ContainerBuilder()
      // .setAccentColor(0x64b5f6) blue
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`Thanks to the chewey API here’s your **${endpoint.replace('-', ' ')}**:`)
      )
      .addSeparatorComponents()
      .addMediaGalleryComponents(
        new MediaGalleryBuilder().addItems(item => item.setURL(imageUrl))
      );

    await interaction.reply({
      components: [container],
      flags: MessageFlags.IsComponentsV2
    });
  }
};

async function fetchFromChewey(endpoint) {
  try {
    const res = await fetch(`https://api.chewey-bot.top/${endpoint}?auth=d1b7bfa2-b0af-4590-9b91-829d408c22d3`);
    const json = await res.json();
    return json.data ?? 'https://placehold.co/600x400?text=No+Image';
  } catch {
    return 'https://placehold.co/600x400?text=API+Error';
  }
}

