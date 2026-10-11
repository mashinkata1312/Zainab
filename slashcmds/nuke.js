// commands/nuke.js
import { SlashCommandBuilder, MessageFlags, ButtonStyle } from 'discord.js';
import {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SectionBuilder,
  ButtonBuilder,
} from '@discordjs/builders';

export default {
  data: new SlashCommandBuilder()
    .setName('nuke')
    .setDescription('Wipes the channel and recreates it. SERVER OWNER ONLY'),

  async execute(interaction) {
    if (interaction.user.id !== interaction.guild.ownerId) {
      const ownerOnlyContainer = new ContainerBuilder()
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent('❌ Only the **Server Owner** can use this command.')
        );
      return interaction.reply({
        components: [ownerOnlyContainer],
        flags: MessageFlags.IsComponentsV2,
      });
    }

    const channel = interaction.channel;

    // Container for the warning message with both buttons in separate sections
    const warningContainer = new ContainerBuilder()
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `⚠️ **Second chance to reconsider !!!!**\n\n` +
          `Are you sure you want to **NUKE** <#${channel.id}>?\n` +
          `This will delete all messages and recreate the channel with **NO** messages restored.\n\n` +
          `**__THIS ACTION CANNOT BE UNDONE!!!!__**`
        )
      )
      .addSeparatorComponents(new SeparatorBuilder())
      .addSectionComponents(
        new SectionBuilder()
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent('Confirm the action below:')
          )
          .setButtonAccessory(
            new ButtonBuilder()
              .setCustomId('nuke_confirm')
              .setLabel('Confirm')
              .setStyle(ButtonStyle.Danger)
          )
      )
      .addSectionComponents(
        new SectionBuilder()
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent('Or cancel the action:')
          )
          .setButtonAccessory(
            new ButtonBuilder()
              .setCustomId('nuke_cancel')
              .setLabel('Cancel')
              .setStyle(ButtonStyle.Secondary)
          )
      );

    await interaction.reply({
      components: [warningContainer],
      flags: MessageFlags.IsComponentsV2,
    });

    const filter = (i) =>
      i.user.id === interaction.user.id &&
      ['nuke_confirm', 'nuke_cancel'].includes(i.customId);

    const collector = interaction.channel.createMessageComponentCollector({
      filter,
      max: 1,
      time: 15000,
    });

    collector.on('collect', async (i) => {
      if (i.customId === 'nuke_cancel') {
        const cancelledContainer = new ContainerBuilder().addTextDisplayComponents(
          new TextDisplayBuilder().setContent('❌ Nuke cancelled.')
        );
        return i.update({ components: [cancelledContainer] });
      }

      if (i.customId === 'nuke_confirm') {
        const nukedContainer = new ContainerBuilder().addTextDisplayComponents(
          new TextDisplayBuilder().setContent('💣 Channel nuked!')
        );
        await i.update({ components: [nukedContainer] });

        try {
          const position = channel.position;
          const parent = channel.parent;

          const cloned = await channel.clone({
            name: channel.name,
            topic: channel.topic,
            nsfw: channel.nsfw,
            bitrate: channel.bitrate,
            userLimit: channel.userLimit,
            rateLimitPerUser: channel.rateLimitPerUser,
          });

          if (parent) await cloned.setParent(parent.id);
          await cloned.setPosition(position);

          await channel.delete();
          await cloned.send('first!');
        } catch (err) {
          console.error(err);
          const errorContainer = new ContainerBuilder().addTextDisplayComponents(
            new TextDisplayBuilder().setContent('⚠️ Failed to nuke channel.')
          );
          await interaction.followUp({
            components: [errorContainer],
            flags: MessageFlags.IsComponentsV2,
          });
        }
      }
    });

    collector.on('end', async (collected) => {
      if (collected.size === 0) {
        const timeoutContainer = new ContainerBuilder().addTextDisplayComponents(
          new TextDisplayBuilder().setContent('⌛ Confirmation timed out.')
        );
        await interaction.editReply({ components: [timeoutContainer] });
      }
    });
  },
};
