const { exec } = require("child_process");
const fs = require("fs");

const removeFile = name => {
  try {
    const stats = fs.statSync(name);
    if (stats.isFile()) fs.unlinkSync(name);
    console.log(`File ${name} was removed`);
  } catch (err) {
    console.log(err);
  }
};

const openFile = name => {
  exec(`start ${name}`, err => {
    if (err) console.log(err);
  });
};

module.exports = { removeFile, openFile };
