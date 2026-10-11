import {
  SlashCommandBuilder,
  MessageFlags
} from 'discord.js';
import {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder
} from '@discordjs/builders';
import fetch from 'node-fetch';

export default {
  data: new SlashCommandBuilder()
    .setName('define')
    .setDescription('Get a complete definition of a word, with examples and synonyms.')
    .addStringOption(option =>
      option
        .setName('word')
        .setDescription('The word you want to define')
        .setRequired(true)
    ),

  async execute(interaction) {
    const word = interaction.options.getString('word');
    await interaction.deferReply();

    try {
      const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
      if (!res.ok) {
        return interaction.editReply({
          content: `❌ No definitions found for **${word}**.`,
          flags: MessageFlags.Ephemeral
        });
      }

      const data = await res.json();
      if (!Array.isArray(data) || data.length === 0) {
        return interaction.editReply({
          content: `❌ No definitions found for **${word}**.`,
          flags: MessageFlags.Ephemeral
        });
      }

      // Merge all meanings from all entries
      const allMeanings = data.flatMap(entry => entry.meanings);

      // Collect unique phonetic texts
      const phonetics = [
        ...new Set(
          data.flatMap(entry => entry.phonetics?.map(p => p.text).filter(Boolean) || [])
        )
      ];

      const meaningText = allMeanings.map(m => {
        const defs = m.definitions.map((d, i) => {
          const defLine = `**${i + 1}.** ${d.definition}`;
          const example = d.example ? `\n*Example:* ${d.example}` : '';
          const synonyms = d.synonyms?.length ? `\n*Synonyms:* ${d.synonyms.join(', ')}` : '';
          const antonyms = d.antonyms?.length ? `\n*Antonyms:* ${d.antonyms.join(', ')}` : '';
          return `${defLine}${example}${synonyms}${antonyms}`;
        }).join('\n\n');
        return `**${m.partOfSpeech}**\n${defs}`;
      }).join('\n\n---\n\n');

      const container = new ContainerBuilder()
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`📚 **${word}**`)
        );

      if (phonetics.length > 0) {
        container.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`**Phonetics:** ${phonetics.join(', ')}`)
        );
      }

      container.addSeparatorComponents();

      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          meaningText.length > 4000
            ? meaningText.slice(0, 4000) + '…'
            : meaningText
        )
      );

      await interaction.editReply({
        components: [container],
        flags: MessageFlags.IsComponentsV2
      });
    } catch (err) {
      console.error(err);
      await interaction.editReply({
        content: '⚠️ An error occurred while fetching the definition.',
        flags: MessageFlags.Ephemeral
      });
    }
  }
};

