from playwright.sync_api import sync_playwright
from seleniumbase import sb_cdp

sb = sb_cdp.Chrome()
endpoint_url = sb.get_endpoint_url()
with sync_playwright() as p:
            browser = p.chromium.connect_over_cdp(endpoint_url)
            page = browser.contexts[0].pages[0]
            page.wait_for_timeout(200)
            page.goto("https://www.yankeecandle.com/yankee-candle/candles/candle-styles/3-wick-candles/chocolate-layer-%E2%80%9Ccackle/SAP_2260380.html")
            page.wait_for_timeout(200)
            print("got to page!")