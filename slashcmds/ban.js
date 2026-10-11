import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';

const data = new SlashCommandBuilder()
  .setName('ban')
  .setDescription('Ban a user by ID or mention, even if they are not in the guild')
  .addStringOption(option =>
    option
      .setName('userid')
      .setDescription('ID of the user to ban')
      .setRequired(true)
  )
  .addStringOption(option =>
    option
      .setName('reason')
      .setDescription('Reason for the ban')
      .setRequired(false)
  )import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Bans a user from the server.')
    .addUserOption(option =>
      option.setName('user').setDescription('The user to ban').setRequired(true)
    )
    .addStringOption(option =>
      option.setName('reason').setDescription('Reason for the ban').setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  async execute(interaction) {
    const targetUser = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    try {
      const member = await interaction.guild.members.fetch(targetUser.id).catch(() => null);

      if (member) {
        await member.ban({ reason });
      } else {
        await interaction.guild.bans.create(targetUser.id, { reason });
      }

   

      // 📩 Ban embed
      const embed = new EmbedBuilder()
        .setColor('Red')
        .setDescription(
          `**${interaction.user.tag}** has banned **${targetUser.tag}** from the server. They won't be able to join back anymore.\n\n` +
          `**Banned User**\n` +
          `${targetUser} (ID: ${targetUser.id})\n\n` +
          `**Reason**\n` +
          `${reason}`
        )
        .setTimestamp();

      await interaction.channel.send({ embeds: [embed] });

    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: `❌ Failed to ban <@${targetUser.id}>. Do I have permission?`,
        ephemeral: true,
      });
    }
  },
};
