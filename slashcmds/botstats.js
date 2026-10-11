import { SlashCommandBuilder, EmbedBuilder, version as djsVersion } from 'discord.js';

const data = new SlashCommandBuilder()
  .setName('botstats')
  .setDescription('Shows stats about the bot');

const execute = async (interaction) => {
  const uptimeSeconds = process.uptime();
  const uptime = new Date(uptimeSeconds * 1000).toISOString().substr(11, 8);
  const memoryUsageMB = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
  const totalCommands = interaction.client.commands ? interaction.client.commands.size : 0;

  const embed = new EmbedBuilder()
    .setTitle('🤖 Bot Stats')
    .addFields(
      { name: 'Uptime', value: uptime, inline: true },
      { name: 'Memory Usage', value: `${memoryUsageMB} MB`, inline: true },
      { name: 'Servers', value: `${interaction.client.guilds.cache.size}`, inline: true },
      { name: 'Users', value: `${interaction.client.users.cache.size}`, inline: true },
      { name: 'Commands', value: `${totalCommands}`, inline: true },
      { name: 'Discord.js Version', value: `v${djsVersion}`, inline: true }
    )
    .setColor('Blurple');

  await interaction.reply({ embeds: [embed] });
};

export default { data, execute };
