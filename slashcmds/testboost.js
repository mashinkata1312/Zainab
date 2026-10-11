import { SlashCommandBuilder } from 'discord.js';
import { getBoostMessageConfig } from '../utils/boostStorage.js';

export default {
  data: new SlashCommandBuilder()
    .setName('testboost')
    .setDescription('Test the boost embed message'),

  async execute(interaction) {
    const config = getBoostMessageConfig(interaction.guild.id);
    if (!config) return interaction.reply({ content: 'No boost config found.', ephemeral: true });

    const formattedMessage = config.message
      .replace(/{user}/g, `<@${interaction.user.id}>`)
      .replace(/{guild}/g, interaction.guild.name)
      .replace(/{boostcount}/g, interaction.guild.premiumSubscriptionCount.toString());

    const embed = {
      description: formattedMessage,
      color: config.embedColor ?? 0xFF73FA,
      footer: config.footer ? { text: config.footer } : undefined,
      timestamp: config.timestamp ? new Date().toISOString() : undefined,
    };

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};
