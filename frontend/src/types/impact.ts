import { RoundRes } from "./client";
import { LayerType } from "./server";

// client两两之间的互信息值
export type MultipleInfo = number[][];

export interface PositionDomain {
  xDomain: number[],
  yDomain: number[]
}

export interface TsneImpact {
  position: number[][][], // id, round->[x, y]
  avgTsne: number[][], // round->[x, y]
  domain: PositionDomain
}
export interface GradientImpact extends TsneImpact {
  diff: number[][], // id->round
};

export interface BehaviorImpact extends TsneImpact {
  multiple: MultipleInfo
}

export interface RoundRange {
  start: number,
  end: number
};

export interface Impact {
  layer: LayerType,
  filter: boolean[],
  clientIds: number[],
  selectedClient: number,
  roundRes: RoundRes[],
  roundRange: RoundRange, // input和brush显示的范围
  fetchDataRange: RoundRange, // 最近一次实际获取数据的round range
  threshold: number,
  gradient: GradientImpact,
  behavior: BehaviorImpact,
};

export const DEFAULT_IMPACT: Impact = {
  layer: 'layer1',
  filter: [],
  clientIds: [],
  selectedClient: 0,
  roundRes: [],
  roundRange: {
    start: 50,
    end: 60
  },
  fetchDataRange: {
    start: 50,
    end: 60
  },
  threshold: 0.4,
  gradient: {
    diff: [],
    position: [],
    avgTsne: [],
    domain: {
      xDomain: [],
      yDomain: []
    }
  },
  behavior: {
    multiple: [],
    position: [],
    avgTsne: [],
    domain: {
      xDomain: [],
      yDomain: []
    }
  }
};
