
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Discord from 'discord.js';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import {
  ButtonBuilder,
  ButtonStyle,
  ContainerBuilder,
  MediaGalleryBuilder,
  SectionBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  MessageFlags,
} from 'discord.js';

dotenv.config();

const {
  Client,
  Collection,
  GatewayIntentBits,
  REST,
  Routes,
  ActionRowBuilder,
  TextInputBuilder,
  TextInputStyle,
  ModalBuilder,
  EmbedBuilder,
  PermissionsBitField,
} = Discord;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildPresences,
  ],
  partials: ['MESSAGE', 'CHANNEL', 'REACTION'], // needed to fetch partials
});

client.commands = new Collection();
const commands = [];
client.tempData = new Map(); // store embed sessions and ttt game states






// Load command files
 async function loadCommands() 
{ const commandsPath = path.join(__dirname, 'commands');
   const files = fs.readdirSync(commandsPath).filter((f) => f.endsWith('.js'));
  for (const file of files) {
    const { default: cmd } = await import(`file://${path.join(commandsPath, file)}`);
    if (cmd.data && cmd.execute) {
      client.commands.set(cmd.data.name, cmd);
      commands.push(cmd.data.toJSON());
    }
 }
 }

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  if (message.content.toLowerCase().startsWith('?spoti')) {
    const command = client.commands.get('spotify');
    if (command && command.execute) {
      await command.execute(message);
    }
  }
});

//
client.on('messageReactionAdd', (reaction, user) => {
  import('./events/messageReactionAdd.js')
    .then(({ default: handler }) => {
      handler(reaction, user);
    })
    .catch(console.error);
});
// 
client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag} in ${client.guilds.cache.size} servers WOOWWWWW !! Masha makes me do SO well, she is so good and is so good and she is really amazing like me we all live`);
  //command loading log
  console.log(`Loaded ${client.commands.size} commands I'm awesome !! all thank to MASHA follow femtomasha for more !!`);
  client.user.setPresence({
    status: 'online',
    activities: [{ name: `Serving ${client.guilds.cache.size} servers`, type: 0 }],
  });
});
// the crazy holidays handling 

// where the interaction handling begins YAYaaa
client.on('interactionCreate', async (interaction) => {
  try {
    // 1) Slash commands register
    if (interaction.isChatInputCommand()) {
      const cmd = client.commands.get(interaction.commandName);
      if (!cmd) return;
      await cmd.execute(interaction, client);

      // 2) Button interactionsssssss
    } else if (interaction.isButton()) {
      const id = interaction.customId;

      // Handle show_all_locked button
      if (id === 'show_all_locked') {
        const everyone = interaction.guild.roles.everyone;
        const lockedChannels = interaction.guild.channels.cache.filter(ch => {
          const perms = ch.permissionsFor(everyone);
          if (!perms) return false;
          if (ch.isTextBased()) return !perms.has('SendMessages', true);
          if (ch.isVoiceBased()) return !perms.has('Connect', true);
          return false;
        });

        const list = lockedChannels.map(ch => `🔒 ${ch}`).join('\n') || '✅ No locked channels.';

        return await interaction.reply({ content: list, ephemeral: true });
      }

      // GTF answer buttons handling
      if (id === 'gtf_answer_submit') {
        const modal = new ModalBuilder()
          .setCustomId('modal_gtf_answer')
          .setTitle('Guess the Country');

        const input = new TextInputBuilder()
          .setCustomId('gtf_answer_input')
          .setLabel('Your answer')
          .setStyle(TextInputStyle.Short)
          .setRequired(true);

        modal.addComponents(new ActionRowBuilder().addComponents(input));
        return interaction.showModal(modal);
      }

      // TicTacToe buttons start with 'ttt_'
      if (id.startsWith('ttt_')) {
        const gameKey = `ttt_${interaction.channel.id}`;
        const game = client.tempData.get(gameKey);
        if (!game) {
          return interaction.reply({ content: 'Game not found or expired.', ephemeral: true });
        }

        // Check if user is one of the players
        if (!game.players.includes(interaction.user.id)) {
          return interaction.reply({ content: "You're not part of this game!", ephemeral: true });
        }

        // Extract button info: format is "ttt_row_col"
        const parts = id.split('_');
        if (parts.length !== 3) {
          return interaction.reply({ content: 'Invalid button ID format.', ephemeral: true });
        }
        const row = parseInt(parts[1]);
        const col = parseInt(parts[2]);
        const index = row * 3 + col;

        if (isNaN(row) || isNaN(col) || row < 0 || row > 2 || col < 0 || col > 2) {
          return interaction.reply({ content: 'Invalid move.', ephemeral: true });
        }

        // Check if the spot is empty
        if (game.board[index] !== null) {
          return interaction.reply({ content: 'That spot is already taken!', ephemeral: true });
        }

        // Check if it's the user's turn
        const currentPlayerId = game.turn === 'X' ? game.players[0] : game.players[1];
        if (interaction.user.id !== currentPlayerId) {
          return interaction.reply({ content: "It's not your turn!", ephemeral: true });
        }

        // Update board
        game.board[index] = game.turn;

        // Check for win or tie
        const winner = checkWinner1D(game.board);
        const tie = isBoardFull1D(game.board);
        let ended = false;
        let content = '';

        if (winner) {
          ended = true;
          const winnerId = winner === 'X' ? game.players[0] : game.players[1];
          content = `Game over! Player **${winner}** (<@${winnerId}>) wins! 🎉`;
        } else if (tie) {
          ended = true;
          content = "It's a tie! No one wins. 🤝";
        } else {
          // Switch turn
          game.turn = game.turn === 'X' ? 'O' : 'X';
          const nextPlayerId = game.turn === 'X' ? game.players[0] : game.players[1];
          content = `It's <@${nextPlayerId}>'s turn (${game.turn})`;
        }

        // Create updated buttons for the board
        const buttons = [];
        for (let row = 0; row < 3; row++) {
          const rowButtons = new ActionRowBuilder();
          for (let col = 0; col < 3; col++) {
            const idx = row * 3 + col;
            const val = game.board[idx];
            rowButtons.addComponents(
              new ButtonBuilder()
                .setCustomId(`ttt_${row}_${col}`)
                .setLabel(val === null ? '⬜' : val)
                .setStyle(val === 'X' ? ButtonStyle.Danger : val === 'O' ? ButtonStyle.Primary : ButtonStyle.Secondary)
                .setDisabled(ended || val !== null)
            );
          }
          buttons.push(rowButtons);
        }

        await interaction.update({ content, components: buttons });

        if (ended) {
          client.tempData.delete(gameKey);
        } else {
          client.tempData.set(gameKey, game);
        }

        return;
      }

      // (Other button handlers such as cat, embed, etc. can be placed here if needed)

    }
    // 3) String Select Menu interactions (LGBTQ Holidays)
    // --- interaction handler for the holidays select menu ---
    if (interaction.isStringSelectMenu()) {
      await handleHolidaySelect(interaction);
    }


    async function handleHolidaySelect(interaction) {
      if (!interaction.isStringSelectMenu()) return;
      if (interaction.customId !== "holidays-month-select") return;

      const monthNum = interaction.values[0];
      const url = `https://raw.githubusercontent.com/MashaDaDev/LGBTQHolidays/main/holidays/${monthNum}.json`;

      let holidays;
      try {
        const res = await fetch(url);
        const text = await res.text();

        // Remove any export/default syntax if present
        const cleaned = text.replace(/^export\s+default\s+/, "").replace(/;$/, "");
        holidays = JSON.parse(cleaned);
      } catch (err) {
        console.error("Failed to read or parse holiday data:", err);
        return interaction.reply({
          content: "❌ Could not load holidays for this month.",
          ephemeral: true,
        });
      }

      if (!holidays || holidays.length === 0) {
        return interaction.update({
          content: `No holidays found for this month.`,
          components: [],
        });
      }

      const embed = new EmbedBuilder()
        .setTitle(`🏳️‍🌈 LGBTQ+ Holidays in Month ${monthNum}`)
        .setColor(0xff69b4);

      holidays.forEach(h => {
        embed.addFields({ name: h.date || "Unknown date", value: h.name || "Unnamed holiday" });
      });

      await interaction.update({ embeds: [embed], components: [interaction.message.components[0]] });

    }



    // end of it
    
    // 3) Modal submissions 
    if (interaction.customId === 'modal_gtf_answer') {
      const answer = interaction.fields.getTextInputValue('gtf_answer_input');
      const gameKey = `gtf_${interaction.user.id}`;
      const game = client.tempData.get(gameKey);

      if (!game) {
        return interaction.reply({ content: 'No active flag guessing game was found, mayb it ended !!!', ephemeral: false });
      }

      const isCorrect = answer.trim().toLowerCase() === game.correct.toLowerCase();

      client.tempData.delete(gameKey);

      return interaction.reply ({
        content: isCorrect ? `✅ Correct! The answer was **${game.correct}**.` : `❌ Incorrect. It was **${game.correct}**.`,
        ephemeral: false 
      });
    }

  } catch (err) {
    console.error(err);
  }
});

// Helper functions for 1D TicTacToe board
function checkWinner1D(board) {
  const lines = [
    [0,1,2], [3,4,5], [6,7,8],  // rows
    [0,3,6], [1,4,7], [2,5,8],  // cols
    [0,4,8], [2,4,6]            // diagonals
  ];
  for (const [a,b,c] of lines) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return null;
}

function isBoardFull1D(board) {
  return board.every(cell => cell !== null);
}

// Helper function for cat API
async function fetchCatUrl() {
  try {
    const res = await fetch('https://api.thecatapi.com/v1/images/search', {
      headers: {
        'x-api-key': 'live_d5lPsRm1doMCpDaUpFDHA5iwXMkMw2YCIefclbn74WoUJ4pQYBLCiErbKGMahCWJ',
      },
    });
    const json = await res.json();
    return json[0]?.url || null;
  } catch {
    return null;
  }
}

// Register slash commands
async function registerCommands() {
  const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
  await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });
}

// Main startup
(async () => {
  await loadCommands();
  await registerCommands();
  client.login(process.env.TOKEN);
})();
