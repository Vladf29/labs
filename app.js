const express = require("express");
const app = express();

const mat = require("./modules/mat");
const xlsx = require("./modules/xlsx");
const utils = require("./modules/utils");

const argvs = process.argv.slice(2);

const data = mat.getResult();

xlsx.writeData(data);

if (argvs[0] === "--server") {
  app.get("/", (req, res) => {
    res.json(data);
  });

  const port = 5000;
  app.listen(port, () => {
    utils.openFile(`firefox http://localhost:${port}`);
  });
}