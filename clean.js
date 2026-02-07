import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.join(
  __dirname,
  "src",
  "data",
  "surahs",
  "2.json"
);

const data = JSON.parse(fs.readFileSync(filePath, "utf8"));

// 👇 TEK SURE VAR, direkt verses dönüyoruz
data.verses.forEach(verse => {

  delete verse.number;
  delete verse.audioSecondary;
  delete verse.ruku;
  delete verse.hizbQuarter;
  delete verse.manzil;

  verse.translation = "";
  verse.footnotes = [];
});

fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
