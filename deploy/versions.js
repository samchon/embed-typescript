const fs = require("fs");
const { version } = require("../package.json");

const visit = async (lib) => {
  const location = `${__dirname}/../packages/${lib}`;
  const pack = JSON.parse(
    await fs.promises.readFile(`${location}/package.json`, "utf8"),
  );
  pack.version = version;
  await fs.promises.writeFile(
    `${location}/package.json`,
    JSON.stringify(pack, null, 2),
  );
};

const main = async () => {
  const directory = await fs.promises.readdir(`${__dirname}/../packages`);
  for (const lib of directory) {
    const stat = await fs.promises.stat(`${__dirname}/../packages/${lib}`);
    if (stat.isDirectory() === true) await visit(lib);
  }
};
main().catch((error) => {
  console.log(error);
  process.exit(-1);
});
