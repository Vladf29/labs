const mat = require("./modules/mat");
const xlsx = require("./modules/xlsx");

const data = mat.getResult();

xlsx.writeData(data);
