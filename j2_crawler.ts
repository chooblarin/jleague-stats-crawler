import { Browser } from "https://deno.land/x/puppeteer@9.0.2/mod.ts";
import { extractRanking } from "./scrape_ranking.ts";

// Jリーグデータサイト順位表
const baseUrl = "https://data.j-league.or.jp/SFRT01/";

const yearId = "2022";

// J2リーグのID
const j2CompId = "522"; // 2022年

export async function crawlAllSections(browser: Browser) {
  const page = await browser.newPage();

  await page.goto(baseUrl, { waitUntil: "networkidle2" });

  await page.waitForSelector("#yearId");
  await page.select("#yearId", yearId);
  await page.waitForTimeout(1000);

  await page.select("#competitionId", j2CompId);
  await page.waitForTimeout(1000);

  const sections: { label: string; value: string }[] = [];

  const options = await page.$$("#competitionSectionId option");
  for (let i = 0; i < options.length; i += 1) {
    const opt = options[i];
    const label = (await page.evaluate((el) => el.text, opt)) as string;
    const value = (await page.evaluate(
      (el) => el.getAttribute("value"),
      opt
    )) as string;

    // 0は"最新節"の値なので除外
    if (value && value !== "0") {
      sections.push({ label, value });
    }
  }

  await page.close();

  return sections;
}

export async function crawlSectionPageContent(
  browser: Browser,
  sectionId: string
) {
  const page = await browser.newPage();

  await page.goto(baseUrl, { waitUntil: "networkidle2" });

  await page.waitForSelector("#yearId");
  await page.select("#yearId", yearId);
  await page.waitForTimeout(1000);

  await page.select("#competitionId", j2CompId);
  await page.waitForTimeout(1000);

  await page.select("#competitionSectionId", sectionId);
  await page.waitForTimeout(1000);

  await page.click("#submit");
  await page.waitForSelector("#search_result");

  const html = await page.content();

  await page.close();

  return extractRanking(html);
}
