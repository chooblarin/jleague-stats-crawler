#!/usr/bin/env -S deno run --unstable --allow-run --allow-env --allow-read --allow-net --allow-write
import puppeteer from "https://deno.land/x/puppeteer@9.0.2/mod.ts";
import { crawlAllSections, crawlSectionPageContent } from "./j2_crawler.ts";

const browser = await puppeteer.launch();

const sections = await crawlAllSections(browser);

console.log(`${sections.length} sections were found`);

for (const section of sections) {
  console.log(`Crawling ${section.label} page...`);

  await crawlSectionPageContent(browser, section.value);
}

await browser.close();
