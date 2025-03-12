import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';
import { input } from '@inquirer/prompts';
import prettier from 'prettier'; // Prettierをインポート

async function promptForSourcePatterns(): Promise<string[]> {
  const sourcePatternInput = await input({
    message: '複製元ファイルのパスを入力してください',
  });

  return sourcePatternInput
    .split('\n')
    .map(pattern => pattern.trim())
    .filter(pattern => pattern);
}

async function promptForAnkenNumber(): Promise<string> {
  return await input({
    message: '案件番号を入力してください',
  });
}

async function promptForTestPatterns(): Promise<string[]> {
  const testPatternInput = await input({
    message: 'テストパターンをカンマ区切りで指定してください',
  });

  return testPatternInput.split(',').map(pattern => pattern.trim());
}

function getTargetDirectory(sourcePatterns: string[]): string {
  const firstSourcePattern = sourcePatterns[0];
  return path.dirname(firstSourcePattern).replace('dist', 'src');
}

async function getUserInput(): Promise<{
  sourcePatterns: string[];
  ankenNumber: string;
  testPatterns: string[];
}> {
  const sourcePatterns = await promptForSourcePatterns();
  const ankenNumber = await promptForAnkenNumber();
  const testPatterns = await promptForTestPatterns();

  return { sourcePatterns, ankenNumber, testPatterns };
}

function createTargetFilePath(sourceFilePath: string, targetDirectory: string, ankenNumber: string, testPattern: string, index: number): string {
  const baseFileName = path.basename(sourceFilePath, '.html');
  const newFileName = `${baseFileName}_${testPattern}-${ankenNumber}-${index + 1}.ejs`;
  return path.join(targetDirectory, newFileName);
}

async function formatHtmlWithPrettier(htmlContent: string): Promise<string> {
  return prettier.format(htmlContent, {
    parser: 'html',
    // 必要に応じてPrettierのオプションを追加できます
  });
}

async function processFiles() {
  const { sourcePatterns, ankenNumber, testPatterns } = await getUserInput();
  const targetDirectory = getTargetDirectory(sourcePatterns);

  for (const sourcePattern of sourcePatterns) {
    const matchedFiles = glob.sync(sourcePattern);

    for (const [index, sourceFile] of matchedFiles.entries()) {
      const fileContent = fs.readFileSync(sourceFile, 'utf-8'); // ファイルの内容を読み込む
      const formattedContent = await formatHtmlWithPrettier(fileContent); // Prettierでフォーマット

      for (const testPattern of testPatterns) {
        const targetFilePath = createTargetFilePath(sourceFile, targetDirectory, ankenNumber, testPattern, index);
        const targetDirPath = path.dirname(targetFilePath);

        // ディレクトリが存在しない場合は作成する
        if (!fs.existsSync(targetDirPath)) {
          fs.mkdirSync(targetDirPath, { recursive: true });
        }

        // フォーマットされた内容をファイルに書き込む
        fs.writeFileSync(targetFilePath, formattedContent);
        console.log(`コピーしてリネームしました: ${sourceFile} => ${targetFilePath}`);
      }
    }
  }
}

processFiles();
