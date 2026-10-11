import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('slowmode')
    .setDescription('Set slowmode delay for this channel (seconds)')
    .addIntegerOption(option =>
      option.setName('duration')
        .setDescription('Duration in seconds (0 to disable)')
        .setRequired(true)
        .setMinValue(0)
        .setMaxValue(21600)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
      return interaction.reply({ content: 'You don’t have permission to use this command.', ephemeral: true });
    }

    const duration = interaction.options.getInteger('duration');
    try {
      await interaction.channel.setRateLimitPerUser(duration, `Slowmode set by ${interaction.user.tag}`);

      return interaction.reply({
        content: duration > 0
          ? `✅ Slowmode set to ${duration} second(s).`
          : '✅ Slowmode disabled for this channel.',
        ephemeral: true
      });
    } catch (error) {
      console.error(error);
      return interaction.reply({ content: '❌ Failed to set slowmode.', ephemeral: true });
    }
  }
};
