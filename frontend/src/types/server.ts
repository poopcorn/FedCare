export type LayerType = 'layer1' | 'layer2';
export type DatasetType = 'FEMNIST' | 'DIGIT5';
export type ModelType = 'none' | 'LeNet';
export interface Server {
  dataset: DatasetType,
  layer: LayerType,
  model: ModelType,
  round: number,
  totalround: number,
  clientNum: number,
  roundDisplay: number[],
  performanceRes: PerformanceRes[],
  serverlatestRound: number,
  test: any,
  error: object,
  auto: boolean,
  showRoundNum: number,
};

export const DEFAULT_SERVER: Server = {
  dataset: 'none' as any,
  layer: 'none' as any,
  model: 'none',
  round: 20,
  totalround: 99,
  clientNum: 4,
  roundDisplay: [],
  performanceRes: [],
  serverlatestRound: 1,
  test: {},
  error: {},
  auto: true,
  showRoundNum: 20,
};

// 具体一轮额训练/测试结果
export interface STrainRes {
  accuracy: number;
  loss: number;
};

// 第x轮某个客户端的结果*比重
export interface RoundClientRes {
  id: number,
  round: number;
  train: STrainRes,
  test: STrainRes,
};

export type RoundPerformance = RoundClientRes[];

// 第x轮所有客户端的（结果*比重）
export interface RoundAllClientRes {
  round: number;
  roundClientRes:RoundPerformance
};

// 具体一轮的所有客户端加权平均训练/测试结果
export interface PerformanceRes {
  round: number;
  trainWAG: STrainRes,
  testWAG: STrainRes,
};



