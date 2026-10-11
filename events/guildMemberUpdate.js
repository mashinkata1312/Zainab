import { Events } from 'discord.js';
import { getBoostConfig } from '../utils/boostStorage.js';

export default {
  name: Events.GuildMemberUpdate,
  async execute(oldMember, newMember) {
    const config = getBoostConfig(newMember.guild.id);
    if (!config || !config.boostRoleId || !config.messageChannelId || !config.messageTemplate) return;

    const hadBoost = oldMember.roles.cache.has(config.boostRoleId);
    const hasBoost = newMember.roles.cache.has(config.boostRoleId);

    if (!hadBoost && hasBoost) {
      const channel = newMember.guild.channels.cache.get(config.messageChannelId);
      if (!channel?.isTextBased()) return;

      const boostCount = newMember.guild.premiumSubscriptionCount ?? 'unknown';

      const message = config.messageTemplate
        .replace(/{user}/g, `<@${newMember.id}>`)
        .replace(/{guild}/g, newMember.guild.name)
        .replace(/{boostcount}/g, boostCount);

      await channel.send({ embeds: [{ description: message, color: config.embedColor || 0xF47FFF }] });
    }
  }
};
