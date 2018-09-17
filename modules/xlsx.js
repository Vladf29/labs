const path = require("path");
const xlsx = require("xlsx-populate");

const { removeFile, openFile } = require("./utils");

const FILE_NAME = path.join(process.cwd(), "out.xlsx");

let offsetTop = 3;
const commonStyle = {
  border: true,
  verticalAlignment: "center",
  horizontalAlignment: "center"
};

const writeData = async data => {
  try {
    const workbook = await xlsx.fromBlankAsync();
    const sheet = workbook.sheet(0);

    const { mat, avrg, avrgGr, sums } = data;

    const d = letter => {
      sheet
        .range(`${letter}1:${letter}${offsetTop + mat.length}`)
        .style(commonStyle);
    };

    ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"].forEach(i => d(i));

    sheet.cell(`A${offsetTop + mat.length}`).value("Sum");

    sheet.cell(`B${offsetTop + mat.length}`).value("Si");

    sheet
      .cell("B2")
      .value([["E1", "A1", "A2", "A3", "A4"], ["A1"], ["A2"], ["A3"], ["A4"]])
      .style({ bold: true });

    sheet
      .cell("C3")
      .value(mat)
      .style({ bold: false, numberFormat: "# ???/???" });

    sheet.cell("C7").value([sums]);

    sheet.column("G").width(20);
    sheet.cell("G1").value("Середн.геометр.");

    avrg.forEach((item, ind) => sheet.cell(`G${offsetTop + ind}`).value(item));

    sheet.cell(`G${3 + avrg.length}`).value(data.sumAvrg);

    sheet.column("H").width(25);
    sheet.cell("H1").value("Сер. геометр. зважене");

    avrgGr.forEach((it, ind) => sheet.cell(`H${offsetTop + ind}`).value(it));

    sheet.column("I").width(30);
    sheet.cell("I1").value("Макс. власне значення");

    sheet.cell(`I${offsetTop}`).value(data.lMax.all);
    sheet.cell(`I${offsetTop + 1}`).value("ІУ");
    sheet.cell(`I${offsetTop + 2}`).value(data.lMax.y);

    sheet.column("J").width(30);
    sheet.cell("J1").value("Відношення узгодженості");
    sheet.cell(`J${offsetTop}`).value(data.matchRatio.r);
    sheet.cell(`J${offsetTop + 1}`).value("М(ІУ), n = 4");
    sheet.cell(`J${offsetTop + 2}`).value(data.matchRatio.const);

    sheet.cell("A12").value("e^T");
    sheet
      .cell("B12")
      .value([[1, 1, 1, 1]])
      .style(commonStyle);

    // sheet.cell("F12").value("e");
    // sheet
    //   .range("F13:F17")
    //   .value("1")
    //   .style(commonStyle);

    const { W } = data;

    sheet.cell("G12").value("[A]^k e");
    sheet.cell("H12").value("e^T [A]^k e");

    W.forEach((item, ind) => {
      const offsetTop = 14 + ind * item.mat.length + ind;
      sheet.cell(`B${offsetTop - 1}`).value("A");
      sheet.cell(`A${offsetTop}`).value(`k=${ind + 1}`);

      sheet
        .cell(`B${offsetTop}`)
        .value(item.mat)
        .style({ ...commonStyle, bold: true });

      item.Ae.forEach((item, ind) =>
        sheet
          .cell(`G${offsetTop + ind}`)
          .value(item)
          .style(commonStyle)
      );

      sheet
        .cell(`H${offsetTop}`)
        .value(item.AeT)
        .style(commonStyle);

      sheet.cell(`I${offsetTop - 1}`).value(`W${ind + 1}`);
      item.w.forEach((item, ind) =>
        sheet
          .cell(`I${offsetTop + ind}`)
          .value(item)
          .style(commonStyle)
      );

      if (item.abs.length > 0) {
        sheet.cell(`J${offsetTop - 1}`).value(`abs(W${ind + 1} - W${ind})`);

        item.abs.forEach((item, ind) =>
          sheet
            .cell(`J${offsetTop + ind}`)
            .value(item)
            .style(commonStyle)
        );

        sheet.cell(`K${offsetTop - 1}`).value("eps");
        sheet.cell(`K${offsetTop}`).value(item.eps);
      }
    });

    removeFile(FILE_NAME);
    await workbook.toFileAsync(FILE_NAME);
    openFile(FILE_NAME);
  } catch (err) {
    console.log(err);
  }
};

module.exports = { writeData };
