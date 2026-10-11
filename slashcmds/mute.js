import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';

const data = new SlashCommandBuilder()
  .setName('mute')
  .setDescription('Timeouts (mutes) a member for a given duration')
  .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
  .addUserOption(option =>
    option.setName('target').setDescription('The member to mute').setRequired(true)
  )
  .addIntegerOption(option =>
    option.setName('duration').setDescription('Duration in minutes').setRequired(true)
  )
  .addStringOption(option =>
    option.setName('reason').setDescription('Reason for muting').setRequired(false)
  );

async function execute(interaction) {
  if (!interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
    return interaction.reply({
      content: '❌ You don’t have permission to use this command.',
      ephemeral: true,
    });
  }

  const member = interaction.options.getMember('target');
  const duration = interaction.options.getInteger('duration');
  const reason = interaction.options.getString('reason') || 'No reason provided';

  if (!member) {
    return interaction.reply({ content: '❌ Could not find that member.', ephemeral: true });
  }

  if (!member.moderatable || member.id === interaction.guild.ownerId) {
    return interaction.reply({ content: '❌ I cannot mute this member.', ephemeral: true });
  }

  try {
    await member.timeout(duration * 60 * 1000, reason);

    // ✅ Success reply
    await interaction.reply({
      content: `✅ Muted **${member.user.tag}** for **${duration}** minute(s).`, 
       ephemeral: true,
    });

    // 📩 Mute embed
    const embed = new EmbedBuilder()
      .setColor('Orange')
      .setDescription(
        `**${interaction.user.tag}** has muted **${member.user.tag}** for **${duration}** minute(s). They cannot send messages or speak during this time.\n\n` +
        `**Muted User**\n` +
        `${member.user} (ID: ${member.user.id})\n\n` +
        `**Reason**\n` +
        `${reason}`
      )
      

    await interaction.channel.send({ embeds: [embed] });

  } catch (error) {
    console.error(error);
    await interaction.reply({
      content: '❌ Failed to mute the member.',
      ephemeral: true,
    });
  }
}

export default { data, execute };

