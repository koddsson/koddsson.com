const fs = require("fs");
const path = require("path");
const { promisify } = require("util");
const Ajv = require("ajv");
const chalk = require("chalk");

const readdir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);
const ajv = new Ajv({ allErrors: true });
const fullPath = path.resolve(__dirname + "/recipes/");

let exitCode = 0;

async function main() {
  const schema = await readFile(path.resolve(__dirname + "/schema.json"));
  const validate = ajv.compile(JSON.parse(schema.toString("utf8")));
  const filenames = await readdir(fullPath);

  for (const filename of filenames) {
    const fullFilename = path.resolve(__dirname + "/recipes/" + filename);
    const recipe = await readFile(fullFilename);

    const valid = validate(JSON.parse(recipe.toString("utf8")));
    if (!valid) {
      console.log(
        chalk.magenta.underline(`${filename} had the following errors:`)
      );
      console.log(
        validate.errors
          .map(error => chalk.blue(` ${error.dataPath} ${error.message}`))
          .join("\n")
      );
      exitCode = 1;
    }
  }
  process.exit(exitCode);
}

main();
