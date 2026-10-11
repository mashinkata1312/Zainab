 import util from 'util';
 import { SlashCommandBuilder } from 'discord.js';

 export default {
   data: new SlashCommandBuilder()
     .setName('eval')
     .setDescription('Evaluate JavaScript code, Masha only !!')
     .addStringOption(option =>
       option.setName('code')
         .setDescription('Code to evaluate using JavaScript')
         .setRequired(true)
     ),

   async execute(interaction) {
     const ownerID = '1107044477748662372'; 

     if (interaction.user.id !== ownerID) {
       return interaction.reply({ content: 'Sorry, but this function is only available to the Lead Developer :( Please dont try again !! If you are a Developer of Berrys Team, contact Masha', ephemeral: true });
     }

     const code = interaction.options.getString('code');

     try {
       let evaled = eval(code);

       if (typeof evaled !== 'string') {
         evaled = util.inspect(evaled);
       }

       if (evaled.length > 1900) {
         evaled = evaled.slice(0, 1900) + '...';
       }

       await interaction.reply(`\`\`\`js\n${evaled}\n\`\`\``);
     } catch (error) {
       await interaction.reply(`\`ERROR\` \`\`\`js\n${error.message}\n\`\`\``);
     }
   }
 };
