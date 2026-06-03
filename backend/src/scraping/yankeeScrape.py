import asyncio
import os
import random
import re
from dotenv import load_dotenv
from playwright.async_api import async_playwright
import psycopg

load_dotenv()


async def insertData(candleName, candleStyle, candleDescription, fragrances):
    dbName = os.getenv("DB_NAME")
    dbUser = os.getenv("DB_USER")
    dbPassword = os.getenv("DB_PASSWORD")
    dbHost = os.getenv("DB_HOST", "127.0.0.1")

    async with await psycopg.AsyncConnection.connect(
        f"dbname={dbName} user={dbUser} password={dbPassword} host={dbHost}"
    ) as conn:
        async with conn.cursor() as cur:
            await cur.execute(
                "INSERT INTO candles (candle_name, candle_style, candle_description, candle_brand) VALUES (%s, %s, %s, %s) RETURNING candle_id",
                (candleName, candleStyle, candleDescription, "yankee"),
            )

            result = await cur.fetchone()
            candle_id = result[0]

            for fragrance in fragrances:
                await cur.execute(
                    """
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
                    """,
                    (fragrance, fragrance, candle_id),
                )
            await conn.commit()


async def closeAd(page):
    try:
        ad = await page.wait_for_selector("#attentive_creative", timeout=7500)
        if ad and await ad.is_visible():
            await page.keyboard.press("Escape")
    except Exception:
        print("no ad")
        pass


async def yankeeScrape():
    async with async_playwright() as playwright:
        browser = await playwright.chromium.launch(headless=False)
        page = await browser.new_page()
        await page.goto("https://www.yankeecandle.com/yankee-candle/candles")

        moreResults = page.get_by_role("button").get_by_text("More Results")
        await closeAd(page)

        while await moreResults.is_visible():
            await page.wait_for_timeout(random.uniform(2000, 4000))

            await moreResults.click()


        links = await page.locator(
            '[aria-labelledby^="name_SAP_"]'
        ).evaluate_all(
            "(candles) => candles.map((candle) => candle.getAttribute('href'))"
        )

        for link in links:
            await page.wait_for_timeout(random.uniform(2000, 5500))

            newPage = await browser.new_page()
            try:
                url = f"https://www.yankeecandle.com{link}"
                await newPage.goto(url)
            except Exception:
                print("could not load page")
                await newPage.close()
                continue

            await closeAd(newPage)

            try:
                fragranceInfo = newPage.get_by_role("button").get_by_text(
                    "About This Fragrance"
                )
                await fragranceInfo.click()
            except Exception:
                await newPage.close()
                continue

            title = (await newPage.locator("h1").first.inner_text()).lower()
            candleInfo = await newPage.get_by_role("region").first.inner_text()

            descriptionMatch = re.search(
                r"(.*?)(?:Top(?:\s+Notes)?\s*:)",
                candleInfo,
                re.DOTALL | re.IGNORECASE,
            )

            if descriptionMatch:
                description = descriptionMatch.group(1).strip()
            else:
                description = "none"
            fragrances = []

            patterns = [
                r"Top\s*(?:notes?)?\s*:\s*(.*?)(?=(?:Mid|Middle)\s*(?:notes?)?\s*:|Base\s*(?:Notes?)?\s*:|Top note is|$)",
                r"(?:Mid|Middle)\s*(?:notes?)?\s*:\s*(.*?)(?=Base\s*(?:notes?)?\s*:|Top note is|$)",
                r"Base\s*(?:notes?)?\s*:\s*(.*?)(?=Top note is|$)",
            ]

            style = "not listed"
            current_url = newPage.url
            if "original-jar-candle" in current_url:
                style = "jar"
            elif "premium-two-wick-12oz-candle" in current_url:
                style = "two-wick"
            elif "large-tumblers" in current_url:
                style = "large tumbler"
            elif "3-wick-candles" in current_url:
                style = "three wick"
            elif "medium-pillars" in current_url:
                style = "medium pillar"
            elif "small-tumblers" in current_url:
                style = "small tumbler"
            elif "mini-candles" in current_url:
                style = "mini"

            for pattern in patterns:
                match = re.search(pattern, candleInfo)

                if match:
                    notes = [
                        note.strip(" .\"'")
                        for note in match.group(1).split(",")
                        if note.strip()
                    ]
                    fragrances.extend(notes)

            print(title, description, fragrances, style)
            await insertData(title, style, description, fragrances)
            await newPage.close()

        await browser.close()


if __name__ == "__main__":
    asyncio.run(yankeeScrape())