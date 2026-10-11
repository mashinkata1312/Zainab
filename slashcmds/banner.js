import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('banner')
    .setDescription('Displays the banner of a user')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to get the banner of')
        .setRequired(false)
    ),

  async execute(interaction) {
    const user = interaction.options.getUser('user') || interaction.user;

    // Force-fetch the full user object to access the banner
    const fullUser = await interaction.client.users.fetch(user.id, { force: true });

    if (!fullUser.banner) {
      return interaction.reply({
        content: `❌ ${user.tag} doesn't have a banner.`,
        ephemeral: true
      });
    }

    const bannerURL = fullUser.bannerURL({ dynamic: true, size: 4096 });

    const embed = new EmbedBuilder()
      .setTitle(`${user.username}'s Banner`)
      .setImage(bannerURL)
      .setColor('Blurple');

    await interaction.reply({ embeds: [embed] });
  }
};
