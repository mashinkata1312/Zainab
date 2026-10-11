import {
  SlashCommandBuilder,
  ChannelType,
  PermissionFlagsBits,
} from 'discord.js';
import { setBoostMessageConfig } from '../utils/boostStorage.js';

export default {
  data: new SlashCommandBuilder()
    .setName('setboost')
    .setDescription('Configure the boost message for your server.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('Channel to send boost messages in')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true))
    .addStringOption(option =>
      option.setName('message')
        .setDescription('Custom message with placeholders {user}, {guild}, {boostcount}')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('footer')
        .setDescription('Footer text (optional)'))
    .addBooleanOption(option =>
      option.setName('timestamp')
        .setDescription('Show timestamp on embed?'))
    .addStringOption(option =>
      option.setName('color')
        .setDescription('Hex color code for the embed (e.g., #FF73FA)')),

  async execute(interaction) {
    const channel = interaction.options.getChannel('channel');
    const message = interaction.options.getString('message');
    const footer = interaction.options.getString('footer');
    const timestamp = interaction.options.getBoolean('timestamp') ?? false;
    const colorHex = interaction.options.getString('color') ?? '#FF73FA';

    const embedColor = parseInt(colorHex.replace('#', ''), 16);

    setBoostMessageConfig(interaction.guild.id, {
      channelId: channel.id,
      message,
      footer,
      timestamp,
      embedColor
    });

    await interaction.reply({
      content: `✅ Boost message set in ${channel}`,
      ephemeral: true,
    });
  }
};
