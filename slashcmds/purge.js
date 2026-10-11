// commands/purge.js
import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';

const data = new SlashCommandBuilder()
  .setName('purge')
  .setDescription('Bulk deletes messages from a channel')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
  .addIntegerOption(option =>
    option.setName('amount')
      .setDescription('Number of messages to scan (2–100)')
      .setRequired(true)
  )
  .addUserOption(option =>
    option.setName('target')
      .setDescription('Only delete messages from this user')
      .setRequired(false)
  );

async function execute(interaction) {
  const amount = interaction.options.getInteger('amount');
  const target = interaction.options.getUser('target');

  // Permission check
  if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
    return interaction.reply({ content: '🚫 You do not have permission to use this command.', ephemeral: true });
  }

  if (amount < 2 || amount > 100) {
    return interaction.reply({ content: 'Please provide a number between 2 and 100.', ephemeral: true });
  }

  try {
    const messages = await interaction.channel.messages.fetch({ limit: amount });

    let filtered = messages;

    if (target) {
      filtered = messages.filter(msg => msg.author.id === target.id);
    }

    const deleted = await interaction.channel.bulkDelete(filtered, true);

    await interaction.reply({
      content: `✅ Deleted ${deleted.size} messages${target ? ` from ${target.tag}` : ''}.`,
      ephemeral: true
    });
  } catch (error) {
    console.error(error);
    await interaction.reply({
      content: '⚠️ Could not delete messages. Make sure they’re under 14 days old.',
      ephemeral: true
    });
  }
}

export default { data, execute };
