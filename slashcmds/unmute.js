// commands/unmute.js
import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';

const data = new SlashCommandBuilder()
  .setName('unmute')
  .setDescription('Removes timeout (unmutes) a member')
  .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
  .addUserOption(option =>
    option.setName('target').setDescription('The member to unmute').setRequired(true)
  );

async function execute(interaction) {
  if (!interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
    return interaction.reply({ content: 'You don’t have permission to use this command.', ephemeral: true });
  }

  const member = interaction.options.getMember('target');

  if (!member) {
    return interaction.reply({ content: 'Could not find that member.', ephemeral: true });
  }

  if (!member.moderatable || member.id === interaction.guild.ownerId) {
    return interaction.reply({ content: 'I cannot unmute this member.', ephemeral: true });
  }

  try {
    await member.timeout(null);
    await interaction.reply(`${member.user.tag} has been unmuted.`);
  } catch (error) {
    console.error(error);
    await interaction.reply({ content: 'Failed to unmute the member.', ephemeral: true });
  }
}

export default { data, execute };
