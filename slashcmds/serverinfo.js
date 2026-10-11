import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

const data = new SlashCommandBuilder()
  .setName('serverinfo')
  .setDescription('Displays information about the server');

const execute = async (interaction) => {
  const { guild } = interaction;

  const embed = new EmbedBuilder()
    .setTitle(`${guild.name} Info`)
    .setThumbnail(guild.iconURL({ dynamic: true }))
    .addFields(
      { name: 'Server Name', value: guild.name, inline: true },
      { name: 'Server ID', value: guild.id, inline: true },
      { name: 'Owner', value: `<@${guild.ownerId}>`, inline: true },
      { name: 'Member Count', value: `${guild.memberCount}`, inline: true },
      { name: 'Created On', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`, inline: true },
      { name: 'Boost Level', value: guild.premiumTier ? `Level ${guild.premiumTier}` : 'None', inline: true },
    )
    .setColor('Blurple');

  await interaction.reply({ embeds: [embed] });
};

export default { data, execute };
