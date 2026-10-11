import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('links')
    .setDescription('Get the invite link and support server'),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle('💖 Support & Invite Links')
      .setDescription('Click the buttons below to invite the bot or join the support server!')
      .setColor('#FF69B4') // Hot pink!
      .setFooter({ text: 'Thanks for supporting!' });

    const inviteUrl = `https://discord.com/oauth2/authorize?client_id=${interaction.client.user.id}&permissions=8&scope=bot%20applications.commands`;
    const supportUrl = 'https://discord.gg/msr9wqWdsh'; 

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel('Invite Bot')
        .setStyle(ButtonStyle.Link)
        .setURL(inviteUrl),

      new ButtonBuilder()
        .setLabel('Support Server')
        .setStyle(ButtonStyle.Link)
        .setURL(supportUrl)
    );

    await interaction.reply({ embeds: [embed], components: [row] });
  }
};
