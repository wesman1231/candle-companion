from tortoise.models import Model
from tortoise import Tortoise, fields
from enum import Enum
from dotenv import load_dotenv
import os
import asyncio

load_dotenv()

POSTGRES_USER = os.getenv('POSTGRES_USER')
POSTGRES_PASSWORD = os.getenv('POSTGRES_PASSWORD')
POSTGRES_DB = os.getenv('POSTGRES_DB')

DATABASE_CONFIG = {
    "connections": {
        "default": f'postgres://{POSTGRES_USER}:{POSTGRES_PASSWORD}@localhost:5432/{POSTGRES_DB}'
    },
    "apps": {
        "models": {
            "models": ['__main__'],
            "default_connection": "default",
        }
    }
}

async def init():
    await Tortoise.init(config = DATABASE_CONFIG)
    await Tortoise.generate_schemas()

class CandleStyle(str, Enum):
    Original_Jar = 'Original Jar Candle'
    Large_Tumbler = 'Large Tumbler'
    Small_Tumbler = 'Small Tumbler'
    Three_Wick = 'Three Wick'
    Mini = 'Mini'

class Fragrances(Model):
    fragranceId = fields.UUIDField(pk=True)
    fragranceName = fields.CharField(max_length = 255)

class Candles(Model):
    candleID = fields.UUIDField(pk=True)
    candleName = fields.CharField(max_length = 255)
    candleStyle = fields.CharEnumField(CandleStyle)

    fragrances = fields.ManyToManyField(
        "models.Fragrances", 
        related_name="candles", 
        through="candles_fragrances" # custom name for the join table
    )

async def main():
    await init()

asyncio.run(main())