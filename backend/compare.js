const fs = require("fs");
const path = require("path");

const ignoredDirs = ["node_modules", ".git"];
const ignoredFiles = ["package.json", "package-lock.json"];

function getAllFiles(dirPath, basePath = dirPath) {
  let files = [];
  fs.readdirSync(dirPath).forEach((file) => {
    if (ignoredDirs.includes(file)) return;
    if (ignoredFiles.includes(file)) return;

    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      files = files.concat(getAllFiles(filePath, basePath));
    } else {
      files.push(path.relative(basePath, filePath));
    }
  });
  return files;
}

function compareDirs(dir1, dir2) {
  const files1 = getAllFiles(dir1);
  const files2 = getAllFiles(dir2);

  const allFiles = new Set([...files1, ...files2]);
  const results = [];

  allFiles.forEach((file) => {
    if (ignoredFiles.includes(path.basename(file))) return;

    const filePath1 = path.join(dir1, file);
    const filePath2 = path.join(dir2, file);
    const exists1 = fs.existsSync(filePath1);
    const exists2 = fs.existsSync(filePath2);

    if (exists1 && !exists2) {
      results.push({ file, status: "deleted" });
    } else if (!exists1 && exists2) {
      results.push({ file, status: "added" });
    } else {
      const content1 = fs
        .readFileSync(filePath1, "utf-8")
        .split("\n")
        .map((line) => line.replace(/\r/g, "").trim());
      const content2 = fs
        .readFileSync(filePath2, "utf-8")
        .split("\n")
        .map((line) => line.replace(/\r/g, "").trim());
      const diffs = [];

      const max = Math.max(content1.length, content2.length);
      for (let i = 0; i < max; i++) {
        const line1 = content1[i] || "";
        const line2 = content2[i] || "";
        if (line1 !== line2) {
          if (!(line1 === "" && line2 === "")) {
            diffs.push({ line: i + 1, old: line1, new: line2 });
          }
        }
      }

      if (diffs.length) results.push({ file, status: "modified", diffs });
    }
  });

  return results;
}

module.exports = { compareDirs };
