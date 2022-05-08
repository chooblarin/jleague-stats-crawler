import { cheerio } from "https://deno.land/x/cheerio@1.0.4/mod.ts";

interface RankRecord {
  id: string;
  rank?: number; // 順位表の順位が空の場合がある。例えばJ1からJ2に降格してきたチームは第１節の結果が無い。
  name: string;
  points: number;
}

// クラブホームページのURLから取得した値をチームのIDとして使用する
const pattern = new URLPattern({ pathname: "/club/:id/profile/" });

export function extractRanking(htmlString: string) {
  const $ = cheerio.load(htmlString);

  const tableBody = $("#search_result tbody");

  const results: RankRecord[] = [];

  // NOTE: tbodyが複数ある場合がある

  tableBody.each((_, el) => {
    const rows = $(el).find("tr");

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

      let parsedRank: number | undefined = parseInt(rank);
      if (isNaN(parsedRank)) {
        parsedRank = undefined;
      }

      const parsedPoints = parseInt(points);
      if (isNaN(parsedPoints)) {
        throw new Error(`Rank of ${id} '${rank}' is not valid number format`);
      }

      results.push({
        id,
        rank: parsedRank,
        name,
        points: parsedPoints,
      });
    }
  });

  return results;
}
