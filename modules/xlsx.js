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

const mathCab = { lMax: 4.32, vals: ["0.832", "0.494", "0.241", "0.0798"] };

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

    sheet.column("G").width(18);
    sheet
      .cell("G1")
      .value("Середн.геометр.")
      .style({ wrapText: true });

    avrg.forEach((item, ind) => sheet.cell(`G${offsetTop + ind}`).value(item));

    sheet.cell(`G${3 + avrg.length}`).value(data.sumAvrg);

    sheet.column("H").width(15);
    sheet.column("I").width(15);

    sheet
      .cell("H1")
      .value("Сер. геометр. зважене")
      .style({ wrapText: true });
    sheet
      .cell("H2")
      .value("(Wi)")
      .style({ bold: true });

    avrgGr.forEach((it, ind) =>
      sheet
        .cell(`H${offsetTop + ind}`)
        .value(it)
        .style({ bold: true })
    );

    sheet
      .cell("I1")
      .value("Макс. власне значення")
      .style({ wrapText: true });
    sheet
      .cell("I2")
      .value("l max")
      .style({ bold: true });

    sheet
      .cell(`I${offsetTop}`)
      .value(data.lMax.all)
      .style({ bold: true });
    sheet.cell(`I${offsetTop + 1}`).value("ІУ");
    sheet.cell(`I${offsetTop + 2}`).value(data.lMax.y);

    sheet.column("J").width(15);
    sheet
      .cell("J1")
      .value("Відношення узгодженості")
      .style({ wrapText: true });
    sheet
      .cell(`J${offsetTop}`)
      .value(data.matchRatio.r + "%")
      .style({ bold: true });
    sheet.cell(`J${offsetTop + 1}`).value("М(ІУ), n = 4");
    sheet.cell(`J${offsetTop + 2}`).value(data.matchRatio.const);

    // ------
    const secondRow = 12;
    sheet.cell(`A${secondRow}`).value("e^T");
    sheet
      .cell(`B${secondRow}`)
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
      sheet.cell(`B${offsetTop - 1}`).value(`A^${ind + 1}`);
      sheet.cell(`A${offsetTop}`).value(`k=${ind + 1}`);

      sheet
        .cell(`B${offsetTop}`)
        .value(item.mat)
        .style({ ...commonStyle, bold: false });

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
        sheet
          .cell(`K${offsetTop}`)
          .value(item.eps)
          .style(commonStyle);
      }
    });

    const K12 = getCell("K", 12);
    const J12 = getCell("J", 12);

    K12(0)
      .value("A*W")
      .style(commonStyle);
    data.AW.forEach((item, ind) => {
      K12(ind + 1)
        .value(item)
        .style(commonStyle);
    });

    J12(0)
      .value("e^T * AW")
      .style(commonStyle);
    J12(1)
      .value(data.eAW)
      .style(commonStyle);

    sheet.column("M").width(15);
    sheet.column("N").width(15);
    sheet.column("O").width(15);

    sheet.range("L1:O7").style(commonStyle);

    const resAlg = [
      [
        "Сер. геометр. зважене",
        "Ітераційний алгоритм",
        "Точне значеня (MathCad)"
      ]
    ];

    sheet
      .cell("M1")
      .value(resAlg)
      .style({ wrapText: true });

    const M1 = getCell("M", 1);
    const N1 = getCell("N", 1);
    const O1 = getCell("O", 1);

    avrgGr.forEach((item, ind) => M1(ind + 1 + 1).value(item));
    data.W[data.W.length - 1].w.forEach((item, ind) =>
      N1(ind + 1 + 1).value(item)
    );
    mathCab.vals.forEach((item, ind) => O1(ind + 1 + 1).value(item));

    sheet
      .cell("L7")
      .value([["l max", data.lMax.all, data.eAW, mathCab.lMax]])
      .style({ bold: true });

    // removeFile(FILE_NAME);
    await workbook.toFileAsync(FILE_NAME);
    openFile(FILE_NAME);

    // if (process.argv.slice(2)[0] === "--server") process.exit();

    function getCell(_cell, _row) {
      const cell = _cell;
      const row = _row;
      return offset => sheet.cell(`${cell}${row + offset}`);
    }
  } catch (err) {
    console.log(err);
  }
};

module.exports = { writeData };
