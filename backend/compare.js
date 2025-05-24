const fs = require("fs");
const path = require("path");

const ignoredDirs = ["node_modules", ".git"];

function getAllFiles(dirPath, basePath = dirPath) {
  let files = [];
  fs.readdirSync(dirPath).forEach((file) => {
    if (ignoredDirs.includes(file)) return;
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
        .map((line) => line.replace(/\r/g, ""));
      const content2 = fs
        .readFileSync(filePath2, "utf-8")
        .split("\n")
        .map((line) => line.replace(/\r/g, ""));
      const diffs = [];

      const max = Math.max(content1.length, content2.length);
      for (let i = 0; i < max; i++) {
        if (content1[i] !== content2[i]) {
          diffs.push({
            line: i + 1,
            old: content1[i] || "",
            new: content2[i] || "",
          });
        }
      }

      if (diffs.length) results.push({ file, status: "modified", diffs });
    }
  });

  return results;
}

module.exports = { compareDirs };
