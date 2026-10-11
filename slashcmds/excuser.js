import {
  SlashCommandBuilder,
  MessageFlags
} from 'discord.js';
import {
  ContainerBuilder,
  TextDisplayBuilder
} from '@discordjs/builders';
import fetch from 'node-fetch';

export default {
  data: new SlashCommandBuilder()
    .setName('excuse')
    .setDescription('Get a random or category-based excuse.')
    .addStringOption(option =>
      option
        .setName('category')
        .setDescription('Optional: choose an excuse category')
        .addChoices(
          { name: 'Family', value: 'family' },
          { name: 'Office', value: 'office' },
          { name: 'College', value: 'college' },
          { name: 'Children', value: 'children' },
          { name: 'Party', value: 'party' },
          { name: 'Funny', value: 'funny' },
          { name: 'Unbelievable', value: 'unbelievable' }
        )
    ),

  async execute(interaction) {
    const category = interaction.options.getString('category');
    await interaction.deferReply();

    try {
      // Build API URL based on category
      const url = category
        ? `https://excuser-three.vercel.app/v1/excuse/${encodeURIComponent(category)}`
        : 'https://excuser-three.vercel.app/v1/excuse';

      const res = await fetch(url);
      if (!res.ok) {
        return interaction.editReply({
          content: `❌ Could not fetch an excuse right now.`,
          flags: MessageFlags.Ephemeral
        });
      }

      const data = await res.json();
      const excuse = data[0]?.excuse || 'No excuse found 😭';
      const cat = data[0]?.category || category || 'unknown';

      // Build Container response
      const container = new ContainerBuilder()
        .addTextDisplayComponents(
          new TextDisplayBuilder()
            .setContent(`🧠 **Excuse Generator**`)
        )
        .addTextDisplayComponents(
          new TextDisplayBuilder()
            .setContent(`> ${excuse}`)
        )
        .addTextDisplayComponents(
          new TextDisplayBuilder()
            .setContent(`**Category:** ${cat}`)
        );

      await interaction.editReply({
        components: [container],
        flags: MessageFlags.IsComponentsV2
      });
    } catch (err) {
      console.error(err);
      await interaction.editReply({
        content: '⚠️ Something went wrong while generating your excuse.',
        flags: MessageFlags.Ephemeral
      });
    }
  }
};

