import discord
from discord.ext import commands
import os

intents = discord.Intents.default()
bot = commands.Bot(command_prefix="?", intents=intents)

@bot.event
async def on_ready():
    print(f"Logged in as {bot.user}")
    try:
        synced = await bot.tree.sync()
        print(f"Synced {len(synced)} commands")
    except Exception as e:
        print(e)

async def main():
    async with bot:
        await bot.load_extension("commands.her")  # adjust path if needed
        await bot.start("THE TOKEN")

import asyncio
asyncio.run(main())
