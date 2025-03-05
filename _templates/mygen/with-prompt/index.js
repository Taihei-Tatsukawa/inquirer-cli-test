const fs = require("fs");
const prettier = require("prettier");
const path = require("node:path");
const SRC_PATH = "src/";

module.exports = {
  prompt: ({ inquirer }) => {
    const questions = [
      {
        type: "input",
        name: "file_paths",
        message: "ファイルパスをカンマ区切りで入力してください。",
      },
    ];
    return inquirer.prompt(questions).then(async (answers) => {
      const { file_paths } = answers;
      const paths = file_paths.split(",").map((filePath) => filePath.trim());
      const results = [];

      for (const file_path of paths) {
        const distFile = fs.readFileSync(file_path, "utf-8");
        const toSrcPath = path.dirname(file_path).replace("dist", "src");
        const fileName = path.basename(file_path, ".html");
        const parsed = await prettier.format(distFile, { parser: "html" });

        const ejsContent = `---
to: ${toSrcPath}/${fileName}.ejs
---
<%- \`${parsed}\` %>
`;

        results.push({ toSrcPath, fileName, ejsContent });
      }

      results.forEach((result) => {
        const outputPath = path.join(
          "/Users/01046083/Desktop/inquirer-cli-test/_templates/mygen/with-prompt",
          `${result.fileName}.ejs.t`,
        );
        fs.mkdirSync(result.toSrcPath, { recursive: true });
        fs.writeFileSync(outputPath, result.ejsContent, "utf-8");
      });

      return answers;
    });
  },
};
