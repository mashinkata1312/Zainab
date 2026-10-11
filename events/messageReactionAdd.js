import { EmbedBuilder } from 'discord.js';
import { getStarboardConfig } from '../utils/starboardStorage.js';

export default async function messageReactionAdd(reaction, user) {
  try {
    if (user.bot) return;

    // Handle partials — fetch if necessary
    if (reaction.partial) await reaction.fetch();
    if (reaction.message.partial) await reaction.message.fetch();

    const message = reaction.message;
    const guild = message.guild;
    if (!guild) return;

    if (reaction.emoji.name !== '⭐') return;

    const config = getStarboardConfig(guild.id);
    if (!config) {
      console.log(`[Starboard] No config for guild ${guild.id}`);
      return;
    }

    const starboardChannelId = config.channelId;
    const starLimit = config.starLimit || 1;
    const allowSelfStar = config.allowSelfStar || false;

    if (!starboardChannelId) {
      console.log(`[Starboard] No channel set for guild ${guild.id}`);
      return;
    }

    if (!allowSelfStar && user.id === message.author.id) {
      console.log(`[Starboard] Self-starring not allowed, ignoring user ${user.id}`);
      return;
    }

    if (reaction.count < starLimit) {
      console.log(`[Starboard] Reaction count ${reaction.count} below limit ${starLimit}`);
      return;
    }

    const starboardChannel = guild.channels.cache.get(starboardChannelId);
    if (!starboardChannel) {
      console.log(`[Starboard] Starboard channel not found for guild ${guild.id}`);
      return;
    }

    // Compose embed
    const embed = new EmbedBuilder()
      .setColor('Yellow')
      .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL() })
      .setDescription(message.content || '[No text content]')
      .setFooter({ text: `⭐ ${reaction.count} | Message ID: ${message.id}` })
      .setTimestamp(message.createdAt)
      .addFields({ name: 'Jump to message', value: `[Click here](${message.url})` });

    await starboardChannel.send({ embeds: [embed] });
    console.log(`[Starboard] Posted message ${message.id} to starboard in guild ${guild.id}`);

  } catch (error) {
    console.error('Error in starboard reaction handler:', error);
  }
}

