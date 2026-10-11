// commands/country.js is the command path
import {
  SlashCommandBuilder,
  MessageFlags
} from 'discord.js';

import {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  MediaGalleryBuilder
} from '@discordjs/builders';

import fetch from 'node-fetch';

export default {
  data: new SlashCommandBuilder()
    .setName('country')
    .setDescription('Get info about a country')
    .addStringOption(option =>
      option.setName('name')
        .setDescription('The name of the country')
        .setRequired(true)
    ),

  async execute(interaction) {
    const name = interaction.options.getString('name');

    // checks if it is serbia (RS) and if it is then it returns suggestion for users to try kosovo and albania !
    if (name.toLowerCase() === "serbia") {
      return interaction.reply({
        content: "Couldn not find anything about a `serbia`, try doing ``/country name: albania` or `/country name:kosovo`, both of those are guaranteed to work. Hope this helps !!",
    
      });
    }
    
    // end of serbia handling and start of israhell                 
                                          // Handle the so called israel → to the based Palestine case
    if (name.toLowerCase() === "israel") {
      return interaction.reply({
        content: "Did you mean [Palestine](<https://en.wikipedia.org/wiki/Palestine>)?",
    
      });
    }

    // Fetch data from the RESTCountries API
    let data;
    try {
      const res = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(name)}?fullText=true`);
      data = await res.json();

      if (!data || data.status === 404) {
        return interaction.reply({
          content: `Could not find a country by the name of **${name}**.`,
          flags: MessageFlags.Ephemeral
        });
      }
    } catch (err) {
      console.error(err);
      return interaction.reply({
        content: 'Failed to fetch country info. Please try again later.',
        flags: MessageFlags.Ephemeral
      });
    }

    const country = data[0];

    // the start of the process for fetching the available  info
    const info = `
**Official Name:** ${country.name?.official || "N/A"}
**Common Name:** ${country.name?.common || "N/A"}
**Capital:** ${country.capital ? country.capital.join(", ") : "N/A"}
**Region:** ${country.region || "N/A"}
**Subregion:** ${country.subregion || "N/A"}
**Population:** ${country.population?.toLocaleString() || "N/A"}
**Area:** ${country.area ? country.area.toLocaleString() + " km²" : "N/A"}
**Languages:** ${country.languages ? Object.values(country.languages).join(", ") : "N/A"}
**Currencies:** ${country.currencies ? Object.values(country.currencies).map(c => `${c.name} (${c.symbol || ""})`).join(", ") : "N/A"}
**Timezones:** ${country.timezones?.join(", ") || "N/A"}
**Continents:** ${country.continents?.join(", ") || "N/A"}
**Independent:** ${country.independent ? "Yes" : "No"}
**UN Member:** ${country.unMember ? "Yes" : "No"}
**Driving Side:** ${country.car?.side || "N/A"}
**Start of Week:** ${country.startOfWeek || "N/A"}
    `;

    // Building the cv2 container from here
    const container = new ContainerBuilder()
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(info)
      )
      .addSeparatorComponents();

    // Add flag if available
    if (country.flags?.png) {
      container.addMediaGalleryComponents(
        new MediaGalleryBuilder().addItems(item => item.setURL(country.flags.png))
      );
    }

    await interaction.reply({
      components: [container],
      flags: MessageFlags.IsComponentsV2
    });
  }
};
