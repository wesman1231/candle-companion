from playwright.sync_api import sync_playwright
import re
import random

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
        page.goto("https://www.yankeecandle.com/yankee-candle/candles/?start=0&sz=435&view=product")

        closeAd(page)
        links = page.locator('.product-tile-link').evaluate_all("(candles) => candles.map((candle) => candle.getAttribute('href'))")

        for link in links:
            page.wait_for_timeout(random.uniform(2000, 5500))
            try:
                newPage = browser.new_page()
                newPage.goto(f'https://www.yankeecandle.com{link}')
                newPage.wait_for_load_state("domcontentloaded")
                closeAd(newPage)
                newPage.get_by_role('link').get_by_text('Read More').click()
            except:
                print("Could not find fragrance info")
                newPage.close()
                continue
            
            title = newPage.locator('h1').first.inner_text()
            description = newPage.locator('.romance-text-all').first.inner_text()
            items = newPage.locator("ul.p-0.m-0 li").all_text_contents()

            
            fragrances = []
            for item in items:
                item = " ".join(item.split())  # clean whitespace

                match = re.match(r"(Top|Mid|Base):\s*(.+)", item)
                if match:
                    notes = [x.strip() for x in match.group(2).split(",")]
                    fragrances.extend(notes)

            print("TITLE:", title, "DESCRIPTION:", description, "FRAGRANCES:", fragrances)
            newPage.close()  
        browser.close()

yankeeScrape()
