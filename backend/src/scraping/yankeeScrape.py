from playwright.sync_api import sync_playwright
import re
import random
import asyncio
from tortoise import Tortoise
from db.dbModels import Candles, Fragrances, POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB

async def init():
    await Tortoise.init(
        db_url = f'postgres://{POSTGRES_USER}:{POSTGRES_PASSWORD}@localhost:5432/{POSTGRES_DB}'
    )

async def yankeeScrape():
    await init()
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=False)
        page = browser.new_page()
        page.goto("https://www.yankeecandle.com/yankee-candle/candles")

        ad = page.wait_for_selector('#attentive_creative', timeout = 7000)
        if ad.is_visible():
            page.keyboard.press('Escape')

        moreResults = page.get_by_role('button').get_by_text('More Results')


        while(moreResults.is_visible()):
            page.wait_for_timeout(random.uniform(2000, 4500))
            moreResults.click()

        candles = page.locator('[aria-labelledby^="name_SAP_"]').all()

        for candle in candles:
            page.wait_for_timeout(random.uniform(2000, 7500))
            candle.click()
            ad = page.wait_for_selector('#attentive_creative', timeout = 5000)
            
            if ad.is_visible():
                page.keyboard.press('Escape')
            
            title = page.locator('h1').first.inner_text()
            print(title)
            page.go_back()
        
    browser.close()

yankeeScrape()
