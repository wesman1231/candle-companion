from playwright.sync_api import sync_playwright
import re
import random
import psycopg
import os
from dotenv import load_dotenv
load_dotenv()

def insertData(candleName, candleStyle, candleDescription, fragrances):
    dbName = os.getenv("DB_NAME")
    dbUser = os.getenv("DB_USER")
    dbPassword = os.getenv("DB_PASSWORD")
    with psycopg.connect(f"dbname={dbName} user={dbUser} password={dbPassword}") as conn: #REPLACE WITH ENV VARIABLES
        #insert candle, insert each fragrance, insert candle and fragrance ids into junction table
        with conn.cursor() as cur:
            cur.execute("INSERT INTO candles (candle_name, candle_style, candle_description, candle_brand) VALUES (%s, %s, %s, %s) RETURNING candle_id", (candleName, candleStyle, candleDescription, "yankee"))

            candle_id = cur.fetchone()[0]

            for fragrance in fragrances:
                cur.execute("""
                WITH upsert_fragrance AS (
                    INSERT INTO fragrances (fragrance_name) 
                    VALUES(%s)
                    ON CONFLICT (fragrance_name) DO NOTHING
                    RETURNING fragrance_id
                ),
                final_fragrance AS (
                    SELECT fragrance_id FROM upsert_fragrance
                    UNION ALL
                    SELECT fragrance_id FROM fragrances WHERE fragrance_name = (%s)
                    LIMIT 1
                )
                INSERT INTO candles_fragrances (candle_id, fragrance_id)
                SELECT %s, fragrance_id FROM final_fragrance LIMIT 1
                ON CONFLICT (candle_id, fragrance_id) DO NOTHING;
                """, (fragrance, fragrance, candle_id))
            conn.commit()

def closeAd(page):
    try:
        ad = page.wait_for_selector('#attentive_creative', timeout = 7500)
        if ad.is_visible():
            page.keyboard.press('Escape')
    except:
        print("no ad")
        pass

def yankeeScrape():
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=False)
        page = browser.new_page()
        page.goto("https://www.yankeecandle.com/yankee-candle/candles")
        #page.goto("https://www.yankeecandle.com/yankee-candle/candles/?start=0&sz=435&view=product")

        moreResults = page.get_by_role('button').get_by_text('More Results')
        closeAd(page)
        while moreResults.is_visible():
            page.wait_for_timeout(random.uniform(2000, 4000))
            moreResults.click()
            if page.locator('[aria-labelledby^="name_SAP_"]').count() == 426:
                break
        
        images = page.locator('[aria-labelledby^="name_SAP_"]').locator('picture').locator('img').evaluate_all("(images) => images.map((image) => image.getAttribute('src'))")
        print(images)

yankeeScrape()
        