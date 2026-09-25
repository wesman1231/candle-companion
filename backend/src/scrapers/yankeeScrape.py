import os
from dotenv import load_dotenv
from playwright.sync_api import sync_playwright
from seleniumbase import sb_cdp
import psycopg

load_dotenv() 

dbName = os.getenv("dbName")
dbUser = os.getenv("dbUser")
dbPassword = os.getenv("dbPassword")

print(f"Connecting to database: '{dbName}' as user: '{dbUser}'")

links = []

def getLinks():
    candlesContainer = page.locator(".sf-product-list-page")

    candleTiles = candlesContainer.locator(".product-tile-container").locator("a").all()

    for tile in candleTiles:
        link = tile.get_attribute("href")
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
        insertCandle = ("""
            INSERT INTO candles (candle_name, candle_thumbnail) VALUES (%s, %s)
            RETURNING candle_id;
        """)

        cur.execute(insertCandle, (candleName, candleThumbnail))

        candleId = cur.fetchone()[0]

        insertFragrance = """
                INSERT INTO fragrances (fragrance_id, fragrance_name) VALUES (%s, %s)
                """

        for fragrance in fragrances:
            cur.execute(insertFragrance, (candleId, fragrance))


def scrapeCandles(links):
    for link in links:
        newPage = browser.contexts[0].new_page()
        newPage.wait_for_timeout(200)
        newPage.goto(f"https://www.yankeecandle.com{link}")

        saveCandleData(getCandleName(newPage), getCandleImage(newPage), getCandleFragrances(newPage))





sb = sb_cdp.Chrome()
endpoint_url = sb.get_endpoint_url()
with psycopg.connect(f"host=127.0.0.1 dbname={dbName} user={dbUser} password={dbPassword}") as conn:
    with conn.cursor() as cur:
        cur.execute("SELECT inet_server_port(), current_database(), pg_backend_pid();")
        print("Python is connected to:", cur.fetchone())
        
        cur.execute("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';")
        print("Tables Python can see:", cur.fetchall())
        with sync_playwright() as p:
            browser = p.chromium.connect_over_cdp(endpoint_url)
            page = browser.contexts[0].pages[0]
            page.goto("https://www.yankeecandle.com/yankee-candle/candles/")

            getLinks()
            scrapeCandles(links)
