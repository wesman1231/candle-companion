import os
from dotenv import load_dotenv
from playwright.sync_api import sync_playwright
from seleniumbase import sb_cdp
import psycopg
import random
import time

load_dotenv() 

dbName = os.getenv("DB_NAME")
dbUser = os.getenv("DB_USER")
dbPassword = os.getenv("DB_PASSWORD")
proxyUser = os.getenv("PROXY_USER")
proxyPassword = os.getenv("PROXY_PASSWORD")
proxyHost = os.getenv("PROXY_HOST")
proxyPort = os.getenv("PROXY_PORT")
wait_time = random.uniform(5, 12)

def getLinks(page):
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
    candleImage = page.get_attribute('[aria-label="Product Image"]', "src")
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
    for frag_group in fragranceTextArray:
        if frag_group:  # Check array is not empty
            split = frag_group[0].split(",")
            for item in split:
                if item.strip():
                    fragranceText.append(item.strip())

    print(f"Fragrances: {fragranceText}")
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
        try:
            newPage.goto(f"https://www.yankeecandle.com{link}", wait_until="domcontentloaded")
            time.sleep(wait_time)
            
            candle_name = getCandleName(newPage)
            candle_img = getCandleImage(newPage)
            fragrances = getCandleFragrances(newPage)
            
            saveCandleData(candle_name, candle_img, fragrances)
        finally:
            newPage.close()



#

sb = sb_cdp.Chrome(use_chromium=True)
sb.goto("https://www.yankeecandle.com/yankee-candle/candles/?offset=48", proxy=f"{proxyUser}:{proxyPassword}@{proxyHost}:{proxyPort}")
endpoint_url = sb.get_endpoint_url()
with psycopg.connect(f"host=127.0.0.1 dbname={dbName} user={dbUser} password={dbPassword}") as conn:
    with conn.cursor() as cur:
        with sync_playwright() as p:
            browser = p.chromium.connect_over_cdp(endpoint_url)
            page = browser.contexts[0].pages[0]
            page.wait_for_timeout(5000)
            page.keyboard.press("Escape")
            while True:
                scrapeCandles(getLinks(page))
                nextButton = page.locator('[aria-label="Next Page"]').first
                if nextButton.is_enabled():
                    nextButton.click()
                    page.wait_for_timeout(5000)
                    page.keyboard.press("Escape")
                else:
                    break
                