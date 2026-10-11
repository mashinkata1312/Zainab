import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { getStarboardConfig, setStarboardConfig } from '../utils/starboardStorage.js';

export default {
  data: new SlashCommandBuilder()
    .setName('setstarboard')
    .setDescription('Configure the starboard system for your server.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('Channel where starred messages will go')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('limit')
        .setDescription('Number of ⭐ required for a message to be starboarded')
        .setRequired(true))
    .addBooleanOption(option =>
      option.setName('allow_self_star')
        .setDescription('Should users be able to star their own messages?')
        .setRequired(false)),

  async execute(interaction) {
    const channel = interaction.options.getChannel('channel');
    const limit = interaction.options.getInteger('limit');
    const allowSelfStar = interaction.options.getBoolean('allow_self_star') ?? false;

    // Get existing config or create a new one if none exists
    let config = getStarboardConfig(interaction.guildId);
    if (!config) config = {};

    // Set/update config values
    config.channelId = channel.id;
    config.starLimit = limit;
    config.allowSelfStar = allowSelfStar;

    // Save config back
    setStarboardConfig(interaction.guildId, config);

    await interaction.reply({
      content: `✅ Starboard configured!\n• Channel: ${channel}\n• Star Limit: **${limit}**\n• Self-star allowed: **${allowSelfStar ? 'Yes' : 'No'}**`,
      ephemeral: true,
    });
  }
};
