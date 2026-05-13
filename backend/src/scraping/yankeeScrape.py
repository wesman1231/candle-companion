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
            cur.execute("INSERT INTO candles (candle_name, candle_style, candle_description, candle_brand) VALUES (%s, %s, %s, %s) RETURNING candle_id", (candleName, candleStyle, candleDescription, "Yankee"))

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

        links = page.locator('[aria-labelledby^="name_SAP_"]').evaluate_all("(candles) => candles.map((candle) => candle.getAttribute('href'))")

        for link in links:
            page.wait_for_timeout(random.uniform(2000, 5500))
            
            newPage = browser.new_page()
            try:
                url = f'https://www.yankeecandle.com{link}'
                newPage.goto(url)
            except:
                print("could not load page")
                continue

            closeAd(newPage)

            try:
                fragranceInfo = newPage.get_by_role('button').get_by_text('About This Fragrance')
                fragranceInfo.click()
            except:
                continue

            title = newPage.locator('h1').first.inner_text()
            candleInfo = newPage.get_by_role('region').first.inner_text()

            descriptionMatch = re.search(
                r"(.*?)(?:Top(?:\s+Notes)?\s*:)",
                candleInfo,
                re.DOTALL | re.IGNORECASE
            )

            if descriptionMatch:
                description = descriptionMatch.group(1).strip()
            else:
                description = "none"
            fragrances = []

            patterns = [
                r"Top\s*(?:notes?)?\s*:\s*(.*?)(?=Mid\s*(?:notes?)?\s*:|Base\s*(?:Notes?)?\s*:|Top note is|$)",

                r"Mid\s*(?:notes?)?\s*:\s*(.*?)(?=Base\s*(?:notes?)?\s*:|Top note is|$)",

                r"Base\s*(?:notes?)?\s*:\s*(.*?)(?=Top note is|$)"
            ]
            
            style = "not listed"
            if "original-jar-candle" in newPage.url:
                style = "Jar"
            elif "premium-two-wick-12oz-candle" in newPage.url:
                style = "Two-Wick"
            elif "large-tumblers" in newPage.url:
                style = "Large Tumbler"
            elif "3-wick-candles" in newPage.url:
                style = "Three Wick"
            elif "medium-pillars" in newPage.url:
                style = "Medium Pillar"
            elif "small-tumblers" in newPage.url:
                style = "Small Tumbler"
            elif "mini-candles" in newPage.url:
                style = "Mini"


            for pattern in patterns:
                match = re.search(pattern, candleInfo)

                if match:
                    notes = [
                        note.strip(" .\"'")
                        for note in match.group(1).split(',')
                        if note.strip()
                    ]

                    fragrances.extend(notes)

            print(
                title,
                description,
                fragrances,
                style
            )
            insertData(title, style, description, fragrances)
            newPage.close()  
        browser.close()

yankeeScrape()
