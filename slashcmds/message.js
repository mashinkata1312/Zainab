// commands/message.js
import {
  SlashCommandBuilder,
  PermissionFlagsBits
} from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("message")
    .setDescription("Pin or unpin a message by ID")
    .addSubcommand(sub =>
      sub.setName("pin")
        .setDescription("Pin a message in this channel")
        .addStringOption(option =>
          option.setName("id")
            .setDescription("The ID of the message to pin")
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub.setName("unpin")
        .setDescription("Unpin a message in this channel")
        .addStringOption(option =>
          option.setName("id")
            .setDescription("The ID of the message to unpin")
            .setRequired(true)
        )
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.PinMessages),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const messageId = interaction.options.getString("id");

    try {
      const channel = interaction.channel;
      const msg = await channel.messages.fetch(messageId);

      if (sub === "pin") {
        await msg.pin();
        return interaction.reply({
          content: `📌 Successfully pinned [this message](${msg.url}).`,
          ephemeral: false
        });
      }

      if (sub === "unpin") {
        await msg.unpin();
        return interaction.reply({
          content: `❌ Unpinned [this message](${msg.url}).`,
          ephemeral: false
        });
      }
    } catch (err) {
      console.error(err);
      return interaction.reply({
        content: "⚠️ Could not find or modify that message. Make sure the ID is valid and in this channel.",
        ephemeral: false
      });
    }
  }
};
