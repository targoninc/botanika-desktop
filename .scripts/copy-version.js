import fs from "fs";

const packageJson = JSON.parse(fs.readFileSync("./package.json", "utf8"));
const version = packageJson.version;
const versionFilePath = "./src/assets/version.txt";
fs.writeFileSync(versionFilePath, version);

console.log("Version copied to " + versionFilePath);
