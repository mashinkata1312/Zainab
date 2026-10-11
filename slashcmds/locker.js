// commands/locker.js
import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
} from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('locker')
    .setDescription('Lock/unlock channels or the entire server')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .addSubcommand(sub =>
      sub
        .setName('lock')
        .setDescription('Lock a channel or the whole server')
        .addChannelOption(option =>
          option
            .setName('channel')
            .setDescription('Channel to lock (leave empty to lock entire server)')
            .setRequired(false)
        )
    )
    .addSubcommand(sub =>
      sub
        .setName('unlock')
        .setDescription('Unlock a channel or the whole server')
        .addChannelOption(option =>
          option
            .setName('channel')
            .setDescription('Channel to unlock (leave empty to unlock entire server)')
            .setRequired(false)
        )
    )
    .addSubcommand(sub =>
      sub
        .setName('status')
        .setDescription('Show all locked channels')),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const channel = interaction.options.getChannel('channel');
    const guild = interaction.guild;
    const everyone = guild.roles.everyone;

    // Helper to lock a channel
    const lockChannel = async ch => {
      try {
        if ([ChannelType.GuildText, ChannelType.GuildAnnouncement, ChannelType.GuildForum].includes(ch.type)) {
          await ch.permissionOverwrites.edit(everyone, { SendMessages: false });
        } else if ([ChannelType.GuildVoice, ChannelType.GuildStageVoice].includes(ch.type)) {
          await ch.permissionOverwrites.edit(everyone, { Connect: false });
        }
      } catch {
        console.log(`Skipping channel ${ch.name} - cannot edit permissions.`);
      }
    };

    // Helper to unlock a channel
    const unlockChannel = async ch => {
      try {
        if ([ChannelType.GuildText, ChannelType.GuildAnnouncement, ChannelType.GuildForum].includes(ch.type)) {
          await ch.permissionOverwrites.edit(everyone, { SendMessages: null });
        } else if ([ChannelType.GuildVoice, ChannelType.GuildStageVoice].includes(ch.type)) {
          await ch.permissionOverwrites.edit(everyone, { Connect: null });
        }
      } catch {
        console.log(`Skipping channel ${ch.name} - cannot edit permissions.`);
      }
    };

    // --- Lock ---
    if (sub === 'lock') {
      await interaction.deferReply({ ephemeral: true });
      if (channel) {
        await lockChannel(channel);
        return interaction.followUp({ content: `🔒 Locked ${channel}` });
      } else {
        for (const ch of guild.channels.cache.values()) {
          await lockChannel(ch);
        }
        return interaction.followUp({ content: '🔒 Locked the entire server' });
      }
    }

    // --- Unlock ---
    if (sub === 'unlock') {
      await interaction.deferReply({ ephemeral: true });
      if (channel) {
        await unlockChannel(channel);
        return interaction.followUp({ content: `🔓 Unlocked ${channel}` });
      } else {
        for (const ch of guild.channels.cache.values()) {
          await unlockChannel(ch);
        }
        return interaction.followUp({ content: '🔓 Unlocked the entire server' });
      }
    }

    // --- Status ---
    if (sub === 'status') {
      const lockedChannels = guild.channels.cache.filter(ch => {
        const perms = ch.permissionsFor(everyone);
        if (!perms) return false;
        if ([ChannelType.GuildText, ChannelType.GuildAnnouncement, ChannelType.GuildForum].includes(ch.type)) {
          return !perms.has('SendMessages', true);
        }
        if ([ChannelType.GuildVoice, ChannelType.GuildStageVoice].includes(ch.type)) {
          return !perms.has('Connect', true);
        }
        return false;
      });

      if (lockedChannels.size === 0) {
        return interaction.reply({ content: '✅ No channels are locked.', ephemeral: true });
      }

      const displayList = lockedChannels.map(ch => `🔒 ${ch}`).slice(0, 20).join('\n');
      const extraCount = lockedChannels.size - 20;

      const embed = new EmbedBuilder()
        .setTitle('🔒 Locked Channels')
        .setColor('Red')
        .setDescription(displayList);

      if (extraCount > 0) embed.setFooter({ text: `+ ${extraCount} more locked channels` });

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('show_all_locked')
          .setLabel('Show All')
          .setStyle(ButtonStyle.Secondary)
      );

      return interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
    }
  },
};

