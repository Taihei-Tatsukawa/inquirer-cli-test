const fs = require("fs");
const prettier = require("prettier");
const path = require("node:path");

module.exports = {
  prompt: ({ inquirer }) => {
    const questions = [
      {
        type: "input",
        name: "file_path",
        message: "ファイルパスを入力してください。",
      },
    ];
    return inquirer.prompt(questions).then(async (answers) => {
      const { file_path } = answers;
      const distFile = fs.readFileSync(file_path, "utf-8");
      const dirName = path.dirname(file_path).replace("dist", "src");
      const fileName = path.basename(file_path, ".html");
      const parsed = await prettier.format(distFile, { parser: "html" });

      return { dirName, fileName, parsed };
    });
  },
};
