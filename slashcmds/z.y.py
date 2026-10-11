import discord
from discord import app_commands
from discord.ext import commands

class Generosity(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    def get_response(self) -> str:
        return (
            " **Flower:** The Jasmine, with its delicate white petals and "
            "intoxicating fragrance, symbolizes purity and kindness.\n\n"
            " **Gemstone:** The Emerald, known as the 'Stone of the Heart', "
            "glows with a lush green that represents renewal and eternal hope.\n\n"
    "In the valley where rivers kiss the earth,\n"
            "Generosity blooms like spring after rain.\n"
            "Emerald fields whisper secrets of rebirth,\n"
            "And jasmine carries the spirit’s refrain."
        )

    @app_commands.command(
        name="her",
        description="the memories"
    )
    async def generosity(self, interaction: discord.Interaction):
        await interaction.response.send_message(self.get_response())

    @commands.Cog.listener()
    async def on_message(self, message: discord.Message):
        if message.author.bot:
            return

        if "generosity" in message.content.lower():
            await message.channel.send(self.get_response())

async def setup(bot: commands.Bot):
    await bot.add_cog(Generosity(bot))
