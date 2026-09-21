from playwright.sync_api import sync_playwright
from seleniumbase import sb_cdp
import re

sb = sb_cdp.Chrome()
endpoint_url = sb.get_endpoint_url()

with sync_playwright() as p:
    browser = p.chromium.connect_over_cdp(endpoint_url)
    page = browser.contexts[0].pages[0]
    page.goto("https://www.yankeecandle.com/yankee-candle/candles/")

    def getLinks():
        candlesContainer = page.locator(".sf-product-list-page")

        candleTiles = candlesContainer.locator(".product-tile-container").locator("a").all()

        links = []

        for tile in candleTiles:
            link = tile.get_attribute("href")
            links.append(link)

        print(links)
        getCandleData(links=links)


    def getCandleData(links):
        for link in links:
            newPage = browser.contexts[0].new_page()

            newPage.wait_for_timeout(200)

            print(link)

            newPage.goto(f"https://www.yankeecandle.com{link}")

            candleName = newPage.locator(".chakra-heading").first.inner_text()

            fragranceTextArray = newPage.locator('[class*="1mhvfii"] div.css-0').evaluate_all("""
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
            

    getLinks()