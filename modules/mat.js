// const mat = [
//   [1, 1 / 3, 1 / 5, 3],
//   [3, 1, 3, 7],
//   [5, 1 / 3, 1, 7],
//   [1 / 3, 1 / 7, 1 / 7, 1]
// ];
const $mat = [
  [1, 3, 3, 7],
  [1 / 3, 1, 4, 5],
  [1 / 3, 1 / 4, 1, 5],
  [1 / 7, 1 / 5, 1 / 5, 1]
];

const mat = $mat.map(item => {
  return item.map(i => {
    if (i > 1 && i > 0) return round(i);
    return round(i);
  });
});

const data = {
  sums: [],
  avrg: [],
  avrgGr: [],
  sumAvrg: 0,
  lMax: {},
  // Match ratio
  matchRatio: { r: 0, const: 0.9 },
  W: [],
  AW: [],
  eAW: 0
};

const getResult = () => {
  getSumsCol();
  getAvrRow();
  getAvrGeo();
  getKIter(4);

  getAW();
  getlMax();

  data.sumAvrg = round(getSum(data.avrg));
  data.matchRatio.r = round((data.lMax.y / data.matchRatio.const) * 100);
  data.matchRatio.rIter = round(
    (data.lMax.iterY / data.matchRatio.const) * 100
  );

  return { ...data, mat };
};

function getAW() {
  const lw = data.W[data.W.length - 1].w;
  for (let i = 0; i < lw.length; i++) {
    let res = 0;
    for (let k = 0; k < mat.length; k++) {
      const temp1 = lw[k];
      const temp2 = mat[i][k];
      res += temp1 * temp2;
    }
    data.AW.push(round(res));
  }

  let res = 0;
  data.AW.forEach(item => (res += 1 * item));
  data.eAW = round(res);
}

function getKIter() {
  const e = 1;

  while (true) {
    let _mat = mat;
    let preMat = mat;
    if (data.W[data.W.length - 1]) {
      _mat = data.W[data.W.length - 1].nextMat;
      preMat = data.W[data.W.length - 1].mat;
    }

    const Ae = [];
    const w = [];
    const newMat = MMULT(_mat, preMat);

    let AeT = 0;
    let res = 0;

    _mat.forEach(m => {
      m.forEach(item => (res += item * e));
      Ae.push(round(res));
      res = 0;
    });

    Ae.forEach(item => (res += item * e));
    AeT = round(res);
    Ae.forEach(item => w.push(round(item / AeT)));
    res = 0;

    /* for (let i = 0; i < _mat.length; i++) {
      const arr = [];
      const arrII = _mat[i];

      for (let ii = 0; ii < arrII.length; ii++) {
        for (let k = 0; k < arrII.length; k++) {
          const x = arrII[k];
          const y = preMat[k][ii];
          res += x * y;
        }

        arr.push(round(res));
        res = 0;
      }

      newMat.push(arr);
    }*/

    const abs = [];
    let eps = 0;
    let flagBreak = false;

    if (data.W.length > 0) {
      const prev = data.W[data.W.length - 1];

      for (let i = 0; i < prev.w.length; i++) {
        const res = Math.abs(prev.w[i] - w[i]);
        abs.push(round(res));
      }

      res = 0;
      abs.forEach(item => (res += item * e));
      eps = +res.toFixed(2);
      if (eps <= 0.01) flagBreak = true;
      res = 0;
    }

    data.W.push({ Ae, AeT, w, mat: _mat, nextMat: newMat, abs, eps });
    if (flagBreak) break;
  }
}

function getSumsCol() {
  for (let i = 0; i < mat.length; i++) {
    let r = 0;
    for (let ii = 0; ii < mat.length; ii++) r += mat[ii][i];
    data.sums.push(round(r));
  }
}

function getlMax() {
  let rr = 0;
  for (let i = 0; i < data.sums.length; i++) {
    rr += data.sums[i] * data.avrgGr[i];
  }
  data.lMax.all = round(rr);
  data.lMax.y = round((data.lMax.all - mat.length) / (mat.length - 1));
  data.lMax.iterY = round((data.eAW - mat.length) / (mat.length - 1));
}

function getAvrRow() {
  mat.forEach(item => {
    const res = item.reduce((p, c) => p * c);
    data.avrg.push(round(Math.pow(res, 1 / mat.length)));
  });
}

function getAvrGeo() {
  let res = getSum(data.avrg);
  data.avrg.forEach(item => {
    data.avrgGr.push(round(item / res));
  });
}

function getSum(numbers = [0]) {
  return numbers.reduce((p, c) => p + c);
}

function MMULT(_arr = [], _arr2 = []) {
  const arr = _arr.slice(0);
  const arr2 = _arr2.length > 0 ? _arr2.slice(0) : arr.slice(0);

  const tempRes = [];
  let res = 0;
  for (let i = 0; i < arr.length; i++) {
    const tempArr = [];
    const temp = arr[i];

    for (let ii = 0; ii < temp.length; ii++) {
      for (let k = 0; k < temp.length; k++) {
        const x = temp[k];
        const y = arr2[k][ii];
        res += x * y;
      }

      tempArr.push(round(res));
      res = 0;
    }

    tempRes.push(tempArr);
  }

  return tempRes;
}

function round(n = 0) {
  return +n.toPrecision(3);
}

module.exports = { getResult };

if (require.main === module) {
  const r = getResult();

  const fs = require("fs");

  fs.writeFile("out.json", JSON.stringify(r), err => {
    if (err) console.log(err);
  });
}
