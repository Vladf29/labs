// const mat = [
//   [1, 1 / 3, 1 / 5, 3],
//   [3, 1, 3, 7],
//   [5, 1 / 3, 1, 7],
//   [1 / 3, 1 / 7, 1 / 7, 1]
// ];
const mat = [
  [1, 3, 3, 7],
  [1 / 3, 1, 4, 5],
  [1 / 3, 1 / 4, 1, 5],
  [1 / 7, 1 / 5, 1 / 5, 1]
];

const data = {
  sums: [],
  avrg: [],
  avrgGr: [],
  sumAvrg: 0,
  lMax: {},
  // Match ratio
  matchRatio: { r: 0, const: 0.9 },
  W: []
};

const getResult = () => {
  getSumsCol();
  getAvrRow();
  getAvrGeo();
  getlMax();
  getMMULT(4);

  data.sumAvrg = +getSum(data.avrg).toPrecision(3);
  data.matchRatio.r = +(data.lMax.y / data.matchRatio.const).toFixed(3);

  return { ...data, mat };
};

function getMMULT() {
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
    const newMat = [];

    let AeT = 0;
    let res = 0;

    _mat.forEach(m => {
      m.forEach(item => (res += item * e));
      Ae.push(+res.toPrecision(3));
      res = 0;
    });

    Ae.forEach(item => (res += item * e));
    AeT = +res.toPrecision(3);
    Ae.forEach(item => w.push(+(item / AeT).toPrecision(3)));
    res = 0;

    for (let i = 0; i < _mat.length; i++) {
      const arr = [];
      const arrII = _mat[i];

      for (let ii = 0; ii < arrII.length; ii++) {
        for (let k = 0; k < arrII.length; k++) {
          const x = arrII[k];
          const y = preMat[k][ii];
          res += x * y;
        }

        arr.push(+res.toPrecision(3));
        res = 0;
      }

      newMat.push(arr);
    }

    const abs = [];
    let eps = 0;
    let flagBreak = false;

    if (data.W.length > 0) {
      const prev = data.W[data.W.length - 1];

      for (let i = 0; i < prev.w.length; i++) {
        const res = Math.abs(prev.w[i] - w[i]);
        abs.push(+res.toPrecision(3));
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
    data.sums.push(+r.toPrecision(3));
  }
}

function getlMax() {
  let rr = 0;
  for (let i = 0; i < data.sums.length; i++) {
    rr += data.sums[i] * data.avrgGr[i];
  }
  data.lMax.all = +rr.toPrecision(3);
  data.lMax.y = +((data.lMax.all - mat.length) / (mat.length - 1)).toPrecision(
    3
  );
}

function getAvrRow() {
  mat.forEach(item => {
    const res = item.reduce((p, c) => p * c);
    data.avrg.push(+Math.pow(res, 1 / mat.length).toPrecision(3));
  });
}

function getAvrGeo() {
  let res = getSum(data.avrg);
  data.avrg.forEach(item => {
    data.avrgGr.push(+(item / res).toPrecision(3));
  });
}

function getSum(numbers = [0]) {
  return numbers.reduce((p, c) => p + c);
}

module.exports = { getResult };

if (require.main === module) {
  getResult();
}
