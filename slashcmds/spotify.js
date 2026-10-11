
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

async function getSpotifyEmbed(user, guild) {
  const member = await guild.members.fetch(user.id);
  const spotifyActivity = member.presence?.activities.find(a => a.name === 'Spotify' && a.type === 2);

  if (!spotifyActivity) {
    return { error: `❌ ${user.username} is not listening to Spotify right now!` };
  }

  const trackId = spotifyActivity.syncId;
  const start = spotifyActivity.timestamps?.start;
  const end = spotifyActivity.timestamps?.end;
  const durationMs = end && start ? end - start : null;

  // authenticate with Spotify API
  const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + Buffer
        .from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`)
        .toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({ grant_type: 'client_credentials' })
  });

  const tokenData = await tokenResponse.json();
  const accessToken = tokenData.access_token;

  if (!accessToken) {
    return { error: '❌ Failed to authenticate with Spotify API.' };
  }

  // fetch full track info
  const trackResponse = await fetch(`https://api.spotify.com/v1/tracks/${trackId}`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  if (!trackResponse.ok) {
    return { error: '❌ Could not fetch track info from Spotify API.' };
  }

  const track = await trackResponse.json();

  const duration = durationMs
    ? `${Math.floor(durationMs / 60000)}:${String(Math.floor((durationMs % 60000) / 1000)).padStart(2, '0')}`
    : `${Math.floor(track.duration_ms / 60000)}:${String(Math.floor((track.duration_ms % 60000) / 1000)).padStart(2, '0')}`;

  const embed = new EmbedBuilder()
    .setColor(0x1DB954)
    .setTitle(`🎵 ${track.name}`)
    .setURL(track.external_urls.spotify)
    .setThumbnail(track.album.images[0]?.url)
    .addFields(
      { name: 'Album', value: track.album.name, inline: true },
      { name: 'Artist', value: track.artists.map(a => a.name).join(', '), inline: true },
      { name: 'Duration', value: duration, inline: true },
      { name: 'Started', value: start ? `<t:${Math.floor(start / 1000)}:R>` : 'Unknown', inline: true },
      { name: ' Track ID', value: track.id, inline: true }
    )
  

  return { embed };
}

export default {
  data: new SlashCommandBuilder()
    .setName('spotify')
    .setDescription('Displays current Spotify song')
    .addUserOption(option =>
      option.setName('member')
        .setDescription('The member whose Spotify activity to check')
        .setRequired(false)
    ),

  // Combined execution for both slash and prefix commands
  async execute(interaction, client) {
  
    if (interaction.content) {
    
      if (!interaction.content.toLowerCase().startsWith('?spotify')) return;

      await interaction.channel.sendTyping();

      // Check if a user was mentioned
      const mentionedUser = interaction.mentions.users.first();
      const targetUser = mentionedUser || interaction.author;

      const result = await getSpotifyEmbed(targetUser, interaction.guild);

      if (result.error) {
        return interaction.reply(result.error);
      }

      return interaction.reply({ embeds: [result.embed] });
    }

    // Handle slash command (interaction)
    await interaction.deferReply();

    // Get the member option, default to the user who ran the command
    const targetUser = interaction.options.getUser('member') || interaction.user;

    const result = await getSpotifyEmbed(targetUser, interaction.guild);

    if (result.error) {
      return interaction.editReply(result.error);
    }

    return interaction.editReply({ embeds: [result.embed] });
  }
};
