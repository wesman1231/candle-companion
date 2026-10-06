import os
from dotenv import load_dotenv
from playwright.sync_api import sync_playwright
from seleniumbase import sb_cdp
import psycopg
import random
import time

load_dotenv() 

dbName = os.getenv("dbName")
dbUser = os.getenv("dbUser")
dbPassword = os.getenv("dbPassword")
wait_time = random.uniform(5, 12)

def getLinks():
    candlesContainer = page.locator(".sf-product-list-page")

    candles = candlesContainer.locator(".product-tile-container").locator("a").all()

    links = []
    for candle in candles:
        link = candle.get_attribute("href")
        links.append(link)

    print(links)
    return links

def getCandleName(page):
    candleName = page.locator(".chakra-heading").first.inner_text()
    print(candleName)
    return candleName


def getCandleImage(page):
    candleImage = page.get_attribute('[data-testid="product-image"]', "src")
    print(candleImage)
    return candleImage


def getCandleFragrances(page):
    fragranceTextArray = page.locator('[class*="1mhvfii"] div.css-0').evaluate_all("""
                elements => elements.map(el => {
                return Array.from(el.childNodes)
                .filter(node => node.nodeType === Node.TEXT_NODE)
                .map(node => node.textContent.trim())
            })
            """)

    fragranceText = []
    
    for i in range(len(fragranceTextArray)):
            split = fragranceTextArray[i][0].split(",")
            for j in range(len(split)):
                fragranceText.append(split[j].strip())

    print(fragranceText)
    return fragranceText

     
def saveCandleData(candleName, candleThumbnail, fragrances):
    with conn.transaction():
        insertCandle = """
            INSERT INTO candles (candle_name, candle_thumbnail, candle_brand) 
            VALUES (%s, %s, %s)
            ON CONFLICT (candle_name) DO UPDATE
            SET candle_name = EXCLUDED.candle_name
            RETURNING candle_id;
        """
        cur.execute(insertCandle, (candleName, candleThumbnail, "yankee"))
        candleId = cur.fetchone()[0]

        upsertFragrance = """
            INSERT INTO fragrances (fragrance_name) 
            VALUES (%s) 
            ON CONFLICT (fragrance_name) DO UPDATE 
            SET fragrance_name = EXCLUDED.fragrance_name 
            RETURNING fragrance_id;
        """

        junctionInsert = """
            INSERT INTO candles_fragrances (candle_id, fragrance_id) 
            VALUES (%s, %s)
            ON CONFLICT DO NOTHING;
        """

        for fragrance in set(fragrances):
            cur.execute(upsertFragrance, (fragrance,))
            fragranceID = cur.fetchone()[0]
            cur.execute(junctionInsert, (candleId, fragranceID))

        


def scrapeCandles(links):
    for link in links:
        newPage = browser.contexts[0].new_page()
        newPage.wait_for_timeout(200)
        newPage.goto(f"https://www.yankeecandle.com{link}")
        time.sleep(wait_time)

        saveCandleData(getCandleName(newPage), getCandleImage(newPage), getCandleFragrances(newPage))





sb = sb_cdp.Chrome(headless=False)
endpoint_url = sb.get_endpoint_url()
with psycopg.connect(f"host=127.0.0.1 dbname={dbName} user={dbUser} password={dbPassword}") as conn:
    with conn.cursor() as cur:
        with sync_playwright() as p:
            browser = p.chromium.connect_over_cdp(endpoint_url)
            page = browser.contexts[0].pages[0]
            page.goto("https://www.yankeecandle.com/yankee-candle/candles/")
            page.wait_for_timeout(5000)
            page.keyboard.press("Escape")
            while True:
                scrapeCandles(getLinks())
                nextButton = page.locator('[aria-label="Next Page"]').first
                if nextButton.is_enabled():
                    nextButton.click()
                    page.wait_for_timeout(5000)
                    page.keyboard.press("Escape")
                else:
                    break
                