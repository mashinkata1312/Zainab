import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kicks a member from the server.')
    .addUserOption(option =>
      option.setName('user').setDescription('The user to kick').setRequired(true)
    )
    .addStringOption(option =>
      option.setName('reason').setDescription('Reason for kicking').setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

  async execute(interaction) {
    const targetUser = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    try {
      const member = await interaction.guild.members.fetch(targetUser.id).catch(() => null);

      if (!member) {
        return interaction.reply({
          content: `❌ Could not find **${targetUser.tag}** in this server.`,
          ephemeral: true,
        });
      }

      await member.kick(reason);

      // ✅ Success reply
      await interaction.reply({
        content: `✅ Kicked **${targetUser.tag}** from the server.`,
        ephemeral: true,
      });

      // 📩 Kick embed
      const embed = new EmbedBuilder()
        .setColor('Orange')
        .setDescription(
          `**${interaction.user.tag}** has kicked **${targetUser.tag}** from the server. They can join back again with an invite link.\n\n` +
          `**Kicked User**\n` +
          `${targetUser} (ID: ${targetUser.id})\n\n` +
          `**Reason**\n` +
          `${reason}`
        )
      

      await interaction.channel.send({ embeds: [embed] });

    } catch (err) {
      console.error(err);
      await interaction.reply({
        content: `❌ Couldn't kick **${targetUser.tag}**. Do I have permission?`,
        ephemeral: true,
      });
    }
  },
};

