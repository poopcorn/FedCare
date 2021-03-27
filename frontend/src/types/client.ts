import { Metric } from "./analysis";

// 具体一轮额训练/测试结果
export interface TrainRes {
  accuracy: number;
  loss: number;
};

// 一个客户端某一轮的结果
export interface ModelRes {
  train: TrainRes;
  test: TrainRes;
};

// 某一轮一个客户端的性能结果
export interface RoundPerformanceRes {
  round: number;
  communicationTime: number;
  train: TrainRes,
  test: TrainRes
};

export interface ClientAvgRes {
  id: number;
  accuracy: number;
  loss: number;
  weight: number;
  anomaly: number;
  contribution: number;
};

// x轮一个客户端的结果
export type Performance = RoundPerformanceRes[];

// Array length = 4, means ULCorner, URCorner, BLCorner, BRCorner
export const AREA_COLOR = ['#80b3ca', '#e5957a', '#d9d9d9', '#dd3f4c'];

// 一个客户端在某一轮的投影数据
export interface ClientArea {
    count: number[],
    fill: string;
};

// 具体某一轮，所有客户端的投影数据和指标数据
export interface RoundRes {
    round: number,
    clientsArea: ClientArea[],
    anomaly: Metric,
    contribution: Metric
}

// 某客户端x轮性能结果
export interface ClientRes {
  id: number,
  performanceRes: Performance
};

export interface ClientState {
  isSelected: boolean,
  isActivated: boolean
};

export const COMPUTE_TIME_MAX = 120;
export const COMPUTE_TIME_RANGE = [50, 70];
export const COMPUTE_TIME_DIFF = COMPUTE_TIME_RANGE[1] - COMPUTE_TIME_RANGE[0];

export type Client = {
  clientRes: ClientRes[],
  clientState: ClientState[],
  roundRes: RoundRes[],
  weight: number[];
  roundShow: number[],
  displayRound: number;
  selectedRound: number;
  extend: boolean;
  suggestedAdversary: Set<number>;
  hoveredClientId: number | null;
  favoriteClietnIds: Set<number>;
};


export const DEFAULT_CLIENTS: Client = {
  clientRes: [],
  clientState: [],
  roundRes: [],
  weight: [],
  roundShow: [],
  displayRound: 10,
  selectedRound: -1,
  extend:false,
  suggestedAdversary: new Set<number>(),
  hoveredClientId: null,
  favoriteClietnIds: new Set(),
};
