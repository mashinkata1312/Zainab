import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('unban')
    .setDescription('Unbans a user by ID')
    .addStringOption(option =>
      option.setName('userid').setDescription('The ID of the user to unban').setRequired(true)
    )
    .addStringOption(option =>
      option.setName('reason').setDescription('Reason for unbanning').setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  async execute(interaction) {
    const userId = interaction.options.getString('userid');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    try {
      const bannedUser = await interaction.client.users.fetch(userId);

      await interaction.guild.bans.remove(userId, reason);

      // ✅ Success reply
      await interaction.reply({
        content: `✅ Unbanned **${bannedUser.tag}** from the server.`,
        ephemeral: true,
      });

      // 📩 Unban embed
      const embed = new EmbedBuilder()
        .setColor('Green')
        .setDescription(
          `**${interaction.user.tag}** has unbanned **${bannedUser.tag}** from the server. They can now join back into the server if they have an invite link.\n\n` +
          `**Unbanned User**\n` +
          `${bannedUser} (ID: ${bannedUser.id})\n\n` +
          `**Reason**\n` +
          `${reason}`
        )
        .setTimestamp();

      await interaction.channel.send({ embeds: [embed] });

    } catch (err) {
      console.error(err);
      await interaction.reply({
        content: `❌ Couldn't unban user with ID \`${userId}\`. Are they banned?`,
        ephemeral: true,
      });
    }
  },
};
