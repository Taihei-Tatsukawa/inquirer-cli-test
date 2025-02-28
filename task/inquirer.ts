import * as fs from "fs";
import * as path from "path";
import { glob } from "glob";
import { input } from "@inquirer/prompts";

const getDirectories = async (): Promise<{
  sourcePatterns: string[];
  targetDir: string;
}> => {
  const sourcePatternInput = await input({
    message: "複製元ファイルのパスを入力してください",
  });

  //TODO: 案件番号をファイル名の接尾辞につける。
  const ankenNumber = await input({
    message: "案件番号を入力してください",
  });

  //TODO: 入力があったらカンマ区切りで配列に変換。配列のindex分ファイルを複製する
  //TODO: 複製したファイル名の接尾辞にテストパターンを'_◯'で追加
  /**
   * a,b,c ... XXX_a.html, XXX_b.html, XXX_c.html
   * hoge,fuga,piyo ... XXX_hoge.html, XXX_fuga.html, XXX_piyo.html
   */
  const testPattern = await input({
    message: "テストパターンをカンマ区切りで指定してください",
  });

  const sourcePatterns = sourcePatternInput
    .split("\n")
    .map((pattern) => pattern.trim())
    .filter((pattern) => pattern);
  console.log(sourcePatterns);

  const targetDir = await input({
    message: "複製先ディレクトリを指定してください",
  });

  return { sourcePatterns, targetDir };
};

async function processFiles() {
  const { sourcePatterns, targetDir } = await getDirectories();

  sourcePatterns.forEach((sourcePattern) => {
    const files = glob.sync(sourcePattern);

    files.forEach((file, index) => {
      const relativePath = path.relative(path.dirname(sourcePattern), file);
      //TODO: 案件番号をファイル名に利用する
      const newFileName =
        path.basename(file, ".html") + `_hoge-${index + 1}.ejs`;
      const targetPath = path.join(targetDir, relativePath);

      const targetDirPath = path.dirname(targetPath);
      if (!fs.existsSync(targetPath)) {
        fs.mkdirSync(targetDirPath, { recursive: true });
      }

      fs.copyFileSync(file, path.join(targetDirPath, newFileName));
      console.log(`コピーしてリネームしました: ${file} => ${newFileName}`);
    });
  });
}

processFiles();
