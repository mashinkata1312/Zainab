import { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('roleinfo')
    .setDescription('Displays info about a role')
    .addRoleOption(option =>
      option.setName('role')
        .setDescription('The role to get info about')
        .setRequired(true)
    ),

  async execute(interaction) {
    const role = interaction.options.getRole('role');

    const permissions = role.permissions.toArray()
      .map(perm => perm
        .replace(/_/g, ' ')
        .toLowerCase()
        .replace(/\b(\w)/g, char => char.toUpperCase()))
      .join(', ') || 'None';

    const embed = new EmbedBuilder()
      .setTitle(`Role info: ${role.name}`)
      .setColor(role.color || 'Grey')
      .addFields(
        { name: 'ID', value: role.id, inline: true },
        { name: 'Color', value: role.hexColor.toUpperCase(), inline: true },
        { name: 'Position', value: role.position.toString(), inline: true },
        { name: 'Mentionable', value: role.mentionable ? 'Yes' : 'No', inline: true },
        { name: 'Members', value: role.members.size.toString(), inline: true },
        { name: 'Permissions', value: permissions.length > 1024 ? permissions.slice(0, 1021) + '...' : permissions, inline: false },
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};
