// commands/github.js
import { SlashCommandBuilder, MessageFlags } from 'discord.js';
import { ContainerBuilder, TextDisplayBuilder, SeparatorBuilder, MediaGalleryBuilder } from '@discordjs/builders';
import fetch from 'node-fetch';

export default {
  data: new SlashCommandBuilder()
    .setName('github')
    .setDescription('Get GitHub profile info with top languages')
    .addStringOption(opt =>
      opt.setName('user')
        .setDescription('GitHub username or profile link')
        .setRequired(true)
    ),

  async execute(interaction) {
    const input = interaction.options.getString('user');
    const username = input.includes('github.com') ? input.split('github.com/')[1].split('/')[0] : input;

    try {
      // Fetch user info
      const userRes = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}`);
      if (!userRes.ok) return interaction.reply({ content: 'GitHub user not found.', ephemeral: true });
      const user = await userRes.json();

      // Fetch latest 5 repos of the user
      const reposRes = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}/repos?sort=created&per_page=5`);
      const repos = reposRes.ok ? await reposRes.json() : [];
      const repoList = repos.map(r => `- [${r.name}](${r.html_url}) ⭐ ${r.stargazers_count}`).join('\n') || 'No recent repos.';

      // Fetch all repos for language analysis
      const allRes = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=100`);
      const allRepos = allRes.ok ? await allRes.json() : [];
      const langCount = {};
      allRepos.forEach(r => { if (r.language) langCount[r.language] = (langCount[r.language] || 0) + 1; });
      const topLangs = Object.entries(langCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([lang, count]) => `${lang} (${count})`)
        .join('\n') || 'No languages found.';

      // Build container
      const container = new ContainerBuilder()
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `**GitHub:** [${user.login}](${user.html_url})\n` +
            `**Name:** ${user.name ?? 'N/A'}\n` +
            `**Bio:** ${user.bio ?? 'N/A'}\n` +
            `**Public repos:** ${user.public_repos}\n` +
            `**Followers:** ${user.followers}\n` +
            `**Following:** ${user.following}\n\n` +
            `**Latest 5 repos:**\n${repoList}\n\n` +
            `**Top languages:**\n${topLangs}`
          )
        )
        .addSeparatorComponents()
        .addMediaGalleryComponents(
          new MediaGalleryBuilder().addItems(item => item.setURL(user.avatar_url))
        );

      await interaction.reply({
        components: [container],
        flags: MessageFlags.IsComponentsV2
      });

    } catch (err) {
      console.error('GitHub command error:', err);
      await interaction.reply({ content: 'Error fetching GitHub data.', ephemeral: true });
    }
  }
};
