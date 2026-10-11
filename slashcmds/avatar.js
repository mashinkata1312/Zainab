// gets a users avatar
import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('avatar')
    .setDescription("Shows a user's avatar to see if it is BANGARANGA")
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to get the avatar of')
        .setRequired(false)
    ),

  async execute(interaction) {
    const user = interaction.options.getUser('user') || interaction.user;

    const avatarURL = user.displayAvatarURL({ dynamic: true, size: 4096 });

    const embed = new EmbedBuilder()
      .setTitle(`${user.username}'s Avatar`)
      .setImage(avatarURL)
      .setColor('Blurple');

    await interaction.reply({ embeds: [embed] });
  }
};
