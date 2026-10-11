import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import fs from 'fs';

export default {
  data: new SlashCommandBuilder()
    .setName('starleaderboard')
    .setDescription('Shows the top users who received the most stars'),

  async execute(interaction, client) {
    const starboardData = JSON.parse(fs.readFileSync('./data/starboardData.json', 'utf-8'));
    const userStats = {};

    // Aggregate stars and message counts
    for (const entry of Object.values(starboardData)) {
      const { authorId, starCount } = entry;

      if (!userStats[authorId]) {
        userStats[authorId] = {
          stars: 0,
          messages: 0
        };
      }

      userStats[authorId].stars += starCount;
      userStats[authorId].messages += 1;
    }

    // Sort by stars
    const topUsers = Object.entries(userStats)
      .sort((a, b) => b[1].stars - a[1].stars)
      .slice(0, 10);

    const leaderboard = await Promise.all(topUsers.map(async ([userId, stats], index) => {
      const user = await client.users.fetch(userId).catch(() => ({ username: 'Unknown User' }));
      return `**#${index + 1}** - ⭐ Stars: ${stats.stars} - Messages: ${stats.messages} -  ${user.username}`;
    }));

    const embed = new EmbedBuilder()
      .setTitle(`🌟 ${interaction.guild.name}'s Star Leaderboard`)
      .setDescription(`Here are the currently most starred users in **${interaction.guild.name}**. Note: Only messages that have been posted on the starboard channel are counted.\n\n` + (leaderboard.join('\n') || '*No starred messages yet.*'))
      .setColor(0xFFD700)
   

    await interaction.reply({ embeds: [embed] });
  }
};

