import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

const data = new SlashCommandBuilder()
  .setName('userinfo')
  .setDescription('Displays information about a user')
  .addUserOption(option =>
    option.setName('target')
      .setDescription('The user to get info about')
      .setRequired(false)
  )
  .addStringOption(option =>
    option.setName('userid')
      .setDescription('User ID to get info for (if not in server)')
      .setRequired(false)
  )
  .setDMPermission(true);

const execute = async (interaction) => {
  const idOption = interaction.options.getString('userid');
  let user;

  if (interaction.options.getUser('target')) {
    user = interaction.options.getUser('target');
  } else if (idOption) {
    try {
      user = await interaction.client.users.fetch(idOption);
    } catch {
      return interaction.reply({ content: 'Invalid user ID or user not found.', ephemeral: true });
    }
  } else {
    user = interaction.user;
  }

  // Try to fetch guild member if possible
  let member = null;
  if (interaction.guild) {
    try {
      member = await interaction.guild.members.fetch(user.id);
    } catch {
      member = null;
    }
  }

  const fetchedUser = await user.fetch();

  const badgeEmojis = {
    'HypeSquadOnlineHouse1': '<:HypeSquadBravery:1163826259374112818>',
    'HypeSquadOnlineHouse2': '<:HypeSquadBrilliance:1163826212750237746>',
    'HypeSquadOnlineHouse3': '<:HypeSquadBalance:1163826232207605760>',
    'DiscordEmployee': '<:DiscordEmployee:1163826090217836665>',
    'Partner': '<:BerryBugHunt:1382843918126944317>',
    'Hypesquad': '<:EarlyDiscordSupporter:1163826116176388187>',
    'BugHunterLevel1': '<:BerryBugHunt:1382843918126944317>',
    'BugHunterLevel2': '<:BugHunterGold:1163826068235485287>',
    'VerifiedDeveloper': '<:earlyverifiedbotdeveloper:1394685329138516081>',
    'ActiveDeveloper': '<:ActiveDeveloper:1163826279456440341>',
    'PremiumEarlySupporter': '<:EarlyDiscordSupporter:1163826116176388187>',
    'CertifiedModerator': '<:moderatorprogramsalumni:1394687456129056809>',
    'Nitro': '<:nitro:1394687719816560650>',
  };

  const devs = ['1107044477748662372', '759725620950335509', '450272921408110593'];
  const isDev = devs.includes(user.id);

  const userFlags = fetchedUser.flags?.toArray() || [];
  const badges = userFlags.map(flag => badgeEmojis[flag] || flag).join(' ') || 'None';

  const embed = new EmbedBuilder()
    .setAuthor({
      name: `${user.tag}`,
      iconURL: user.displayAvatarURL({ dynamic: true }),
    })
    .setThumbnail(user.displayAvatarURL({ dynamic: true }))
    .setColor(fetchedUser.accentColor ?? 'Blurple')
    .addFields(
      { name: '👤 Username', value: user.username, inline: true },
      { name: '🆔 ID', value: user.id, inline: true },
      { name: '🏅 Badges', value: badges, inline: false },
      { name: '📅 Account Created', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`, inline: true },
    );

  if (member?.joinedTimestamp) {
    embed.addFields({
      name: '📥 Joined Server',
      value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`,
      inline: true,
    });
  }

  if (isDev) {
    embed.addFields({ name: '💻 Acknowledgements', value: 'Bot Developer' });
  }

  if (fetchedUser.banner) {
    embed.setImage(fetchedUser.bannerURL({ size: 1024, dynamic: true }));
  }

  await interaction.reply({ embeds: [embed] });
};

export default { data, execute };
