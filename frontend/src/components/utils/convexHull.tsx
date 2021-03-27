import { min } from "d3";
import { cos } from "./math";

const crossProduct = (res: number[][], point: number[]): number => {
  const length = res.length;
  const prePoint = res[length - 1];
  const dbPrePoint = res[length - 2];
  const curVector = [point[0] - prePoint[0], point[1] - prePoint[1]];
  const preVector = [dbPrePoint[0] - prePoint[0], dbPrePoint[1] - prePoint[1]];
  return curVector[0] * preVector[1] - curVector[1] * preVector[0];
};

// Graham 算法计算凸包
// 注意Y值，在svg中，y值越大，点越在底部
export const Graham = (data: number[][]): [number, number][] => {
  const res: number[][] = [];
  let maxY = data[0][1],
      minX = data[0][0],
      minId = 0;
  // 取在最底端的值
  for (let index = 1; index < data.length; index++) {
    if (data[index][1] > maxY || (data[index][1] == maxY && data[index][0] < minX)) {
      maxY = data[index][1];
      minX = data[index][0];
      minId = index;
    }
  }
  // 对data的y值进行变化，使得y值最小的在最低端
  for (let index = 0; index < data.length; index++) {
    data[index][1] = maxY - data[index][1];
  }
  const angleSort = [];
  const vectorX = [1, 0];
  for (let i = 0; i < data.length; i++) {
    const vector = [data[i][0] - minX, data[i][1]];
    angleSort.push({
      dis: minId == i ? 10 : cos(vector, vectorX),
      id: i
    });
  }
  // cos Descending ==> angle Ascending
  angleSort.sort((a, b) => b.dis - a.dis);
  res.push(data[angleSort[0].id], data[angleSort[1].id]);
  for (let i = 2; i < angleSort.length; i++) {
    // 当前向量和上一个向量方向为顺时针方向（内积小于0），则删除
    while (res.length >= 2 && crossProduct(res, data[angleSort[i].id]) <= 0) {
      res.pop();
    }
    res.push(data[angleSort[i].id]);
  }
  // 再映射回去，使得y值最大的在svg底端
  for (let index = 0; index < res.length; index++) {
    res[index][1] = maxY - res[index][1];
  }
  return res as any;
}