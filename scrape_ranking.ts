import { cheerio } from "https://deno.land/x/cheerio@1.0.4/mod.ts";

interface RankRecord {
  id: string;
  rank: number;
  name: string;
  points: number;
}

// クラブホームページのURLから取得した値をチームのIDとして使用する
const pattern = new URLPattern({ pathname: "/club/:id/profile/" });

export function extractRanking(htmlString: string) {
  const $ = cheerio.load(htmlString);

  const tableBody = $("#search_result tbody");

  // tbodyが複数ある場合には最初のtbodyを使う
  const firstBody = tableBody.eq(0);

  const rows = firstBody.find("tr");

  const results: RankRecord[] = [];

  for (let i = 0; i < rows.length; i += 1) {
    const row = rows.eq(i);
    const rank = row.find(".wd01").text().trim();

    const nameData = row.find(".wd02");
    const name = nameData.text().trim();
    const profileUrl = nameData.find("a").attr("href");
    if (!profileUrl) {
      throw Error("profileUrl couldn't found");
    }
    const id = pattern.exec(profileUrl)?.pathname.groups.id;
    if (!id) {
      throw Error(`id couldn't be extracted from profileUrl '${profileUrl}'`);
    }

    const points = row.find(".wd03").text().trim();

    results.push({
      id,
      rank: parseInt(rank),
      name,
      points: parseInt(points),
    });
  }

  return results;
}