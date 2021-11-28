#!/usr/bin/env -S deno run --unstable --allow-run --allow-env --allow-read --allow-net --allow-write
import puppeteer from "https://deno.land/x/puppeteer@9.0.2/mod.ts";
import { crawlAllSections, crawlSectionPageContent } from "./j2_crawler.ts";

const browser = await puppeteer.launch();

const sections = await crawlAllSections(browser);

console.log(`${sections.length} sections were found`);

const results = [];

for (const section of sections) {
  console.log(`Crawling ${section.label} page...`);

  const rankRecords = await crawlSectionPageContent(browser, section.value);

  results.push({
    section,
    rankRecords
  });
}

Deno.writeTextFileSync("out.json", JSON.stringify(results));

await browser.close();

console.log("Success");
