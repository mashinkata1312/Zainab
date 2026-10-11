import {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from 'discord.js';

function renderBoard(board, disabled = false) {
  const rows = [];
  for (let r = 0; r < 3; r++) {
    const row = new ActionRowBuilder();
    for (let c = 0; c < 3; c++) {
      const idx = r * 3 + c;
      const val = board[idx];
      row.addComponents(
        new ButtonBuilder()
          .setCustomId(`ttt_${r}_${c}`)
          .setLabel(val ?? '⬜')
          .setStyle(
            val === 'X' ? ButtonStyle.Danger :
            val === 'O' ? ButtonStyle.Primary :
            ButtonStyle.Secondary
          )
          .setDisabled(disabled || val !== null)
      );
    }
    rows.push(row);
  }
  return rows;
}

export default {
  data: new SlashCommandBuilder()
    .setName('ttt')
    .setDescription('Start a game of TicTacToe with another user')
    .addUserOption(option =>
      option.setName('opponent').setDescription('Your opponent').setRequired(true)
    ),

  async execute(interaction, client) {
    const opponent = interaction.options.getUser('opponent');
    const challenger = interaction.user;

    if (opponent.bot || opponent.id === challenger.id) {
      return interaction.reply({ content: 'Invalid opponent selected.', ephemeral: true });
    }

    const gameKey = `ttt_${interaction.channel.id}`;
    if (client.tempData.has(gameKey)) {
      return interaction.reply({ content: 'A game is already in progress here.', ephemeral: true });
    }

    const board = Array(9).fill(null);
    const gameState = {
      board,
      players: [challenger.id, opponent.id],
      turn: 'X',
      playerX: challenger.id,
      playerO: opponent.id,
    };

    client.tempData.set(gameKey, gameState);

    await interaction.reply({
      content: `🎮 TicTacToe started! <@${challenger.id}> (❌) vs <@${opponent.id}> (⭕)\nIt's <@${challenger.id}>'s turn (❌)`,
      components: renderBoard(board),
    });
  },
};


