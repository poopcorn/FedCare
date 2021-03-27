import * as d3 from 'd3';
import {  AREA_COLOR, ClientArea, Metric } from '../../types';

export const ArrayRemove = (x: any[], from: number, to?: number): any[] => {
  const rest = x.slice((to || from) + 1 || x.length);
  x.length = from < 0 ? x.length + from : from;
  x.push(...rest);
  return x;
}

export function sum(a: number[]): number {
    return a.reduce((prev, cur) => prev + cur, 0);
}

export function sumBoolean(a: boolean[]): number {
    return a.reduce((prev: number, cur) => prev +((cur === true) ? 1 : 0), 0);
}

export const calculate2DimAvg = (a: number[][][]): number[][] => {
  const length = a.length;
  const xLength = a[0].length;
  const yLength = a[0][0].length;
  const avg: number[][] = new Array(xLength).fill(0).map(v => new Array(yLength).fill(0));
  for (let i = 0; i <= length; i++) {
    for (let x = 0; x < xLength; x++) {
      for (let y = 0; y < yLength; y++) {
        if (i === length) {
          avg[x][y] /= length;  
        }
        else {
          avg[x][y] += a[i][x][y]
        }
      }
    }
  }
  return avg;
}

export const euclideanDis = (a: number[], b: number[]) => {
  let sum = 0;
  a.forEach((v, i) => sum += (v - b[i]) ** 2);
  return Math.sqrt(sum);
}

/**
 * 计算两个数组之间的cos距离
 * @param a
 * @param b 
 * @returns distance
 */
export const cos = (a: number[], b: number[]): number => {
  if (a.length !== b.length)
    console.assert('Lenght of array A && B to Cos are not equal!');
  let res = 0, 
      sumA = 0,
      sumB = 0,
      length = a.length;
  for (let index = 0; index < length; index++) {
    res += a[index] * b[index];
    sumA += a[index] ** 2;
    sumB += b[index] ** 2;
  }
  return res / (Math.sqrt(sumA) * Math.sqrt(sumB));
};

/**
 * 对距离矩阵进行归一化
 * @param matrix 
 */
export const sim2dist = (matrix: number[][]): number[][] => {
  const newMatrix = matrix.reduce((prev, cur) => prev.concat(cur), []);
  const normalize = d3.scaleLinear()
      .domain([Math.min(...newMatrix), Math.max(...newMatrix)])
      .range([0, 1]);

  const result = [];
  for (let i = 0; i < matrix.length; i++) {
      result.push(matrix[i].map(v => 1 - normalize(v)));
  }

  return result;
}

/**
 * 对数组进行采样，fix为一定会被选中的id
 * @param larger 
 * @param sample 
 * @param fix 
 */
export function sampleToFix(larger: number, sample: number, fix?: number): number[] {
    const res = [];
    if (larger <= sample) {
        for (let index = 0; index < larger; index++) 
            res.push(index);
        return res;
    }

    const p = sample / larger;
    const mark = new Array(larger).fill(true);
    if (fix) {
        res.push(fix);
        mark[fix] = false;
    }
    
    while (res.length < sample) {
        for (let index = 0; index < larger; index++) 
            if (mark[index] && Math.random() <= p) {
                res.push(index);
                mark[index] = false;
                if (res.length == sample)
                    break;
            }
    }
    res.sort((a, b) => a - b);
    return res;
}

/**
 * 计算绘制 boxplot 关键数据：quantiles, median, min and max
 * @param plainDataArray array of boxplot
 */
export function computeBoxPlot(data: number[]) {
    data.sort(d3.ascending);
    const q1 = d3.quantile(data, 0.25) as number;
    const median = d3.quantile(data, 0.5) as number;
    const q3 = d3.quantile(data, 0.75) as number;
    const interQuantileRange = q3 - q1;
    const min = q1 - 1.5 * interQuantileRange;
    const max = q1 + 1.5 * interQuantileRange;
    return {
      outliers: data.filter((d) => d < min || d > max),
      quantiles: [q1, median, q3] as [number, number, number],
      range: [min, max] as [number, number]
    };
}

/**
 * 计算某一轮中，所有client的投影颜色和出现次数
 */
export const computeClientArea = (anomaly: Metric, contribution: Metric, anomalyFilter: boolean[], contributionFilter: boolean[], clientNum: number): ClientArea[] => {
    const anomalyShow = anomalyFilter.map((f, index) => ({
      f: f,
      index: index
    })).filter((v) => v.f == true);
    const contriShow = contributionFilter.map((f, index) => ({
      f: f,
      index: index
    })).filter((v) => v.f == true);
    const clientAreas: ClientArea[] = new Array(clientNum).fill({}).map(v => ({
      count: [0, 0, 0, 0],
      fill: ''
    }));
    const contriScale = contriShow.map(contriV => {
      const index = contriV.index;
      const metricValues = contribution.value.map(clientMetric => clientMetric.vector[index]);
      return (Math.min(...metricValues) + Math.max(...metricValues)) / 2;
    });
    const anomalyScale = anomalyShow.map(anomalyV => {
      const index = anomalyV.index;
      const metricValues = anomaly.value.map(clientMetric => clientMetric.vector[index]);
      return (Math.min(...metricValues) + Math.max(...metricValues)) / 2;
    });
    anomalyShow.forEach((anomalyV, anomalyShowIndex) => {
      contriShow.forEach((contriV, contriShowIndex) => {
        const anomalyIndex = anomalyV.index;
        const contriIndex = contriV.index;
        const middleY = contriScale[contriShowIndex];
        const middleX = anomalyScale[anomalyShowIndex];
        new Array(clientNum).fill(0).map((v, i) =>
          {
            const clientX = anomaly.value[i].vector[anomalyIndex];
            const clientY = contribution.value[i].vector[contriIndex];
            const isContribution = clientY >= middleY;
            const isAnomaly = clientX >= middleX;
            const areaPos: number = (!isContribution as any) * 2 + (isAnomaly ? 1 : 0);
            clientAreas[i].count[areaPos]++;
        });
      });
    });

    // set client Area
    for (let clientId = 0; clientId < clientAreas.length; clientId++) {
      const maxV = Math.max(...clientAreas[clientId].count);
      const maxId = clientAreas[clientId].count.indexOf(maxV);
      clientAreas[clientId].fill = AREA_COLOR[maxId];
    }
    return clientAreas;
};

export const getPositionMinMax = (position: number[][]) => {
  const x = position.map(v => v[0]);
  const y = position.map(v => v[1]);
  return {
    xDomain: [Math.min(...x), Math.max(...x)],
    yDomain: [Math.min(...y), Math.max(...y)]
  };
}

export const getFixLengthPointInLine = (start: number[], end: number[], len: number) => {
  const diffX = end[0] - start[0];
  const diffY = end[1] - start[1];
  const distance = Math.sqrt(diffY ** 2 + diffX ** 2);
  const rate = len / distance;
  return [
    start[0] + diffX * rate,
    start[1] + diffY * rate
  ];
}