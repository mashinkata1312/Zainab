// displays all commands like a help cmnd 
import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('commands')
    .setDescription('List all available commands with descriptions'),

  async execute(interaction) {
    const commands = Array.from(interaction.client.commands.values());

    const descriptionList = commands
      .map(cmd => `• \`${cmd.data.name}\`: ${cmd.data.description || 'No description'}`)
      .join('\n');

    const embed = new EmbedBuilder()
      .setTitle('My Commands !!')
      .setDescription(descriptionList)
      .setColor('#FF69B4') // hot pink
      .setFooter({ text: `Total commands: ${commands.length}` });

    await interaction.reply({ embeds: [embed] });
  }
};
