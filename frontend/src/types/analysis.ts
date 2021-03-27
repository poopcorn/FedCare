import { ClientArea } from "./client";

export interface MetricValue {
    id: number,
    vector: number[]
};

export interface Position {
    x: number,
    y: number
};
export interface HistoryValue {
    round: number,
    value: number
};

export enum SpaceType {
    Anomaly = 0,
    Contribution
};
export interface ClientValue {
    id: number,
    value: number
};

export interface Metric {
    metrics: string[],
    scale: number[][],
    value: MetricValue[],
};

export const DEFAULT_CONTRIBUTION_METRICS = ['Grad-eu', 'Grad-cos', 'Perf-Acc', 'Perf-Loss'];
export const DEFAULT_ANOMALY_METRICS = ['Krum', 'Zeno', 'Auror', 'Sniper', 'PCA'];

export const DEFAULT_CONTRIBUTION_SCALE = [[-1, 1], [-1, 1], [-1 , 1], [-1 ,1]];
export const DEFAULT_ANOMALY_SCALE = [[0, 1], [0, 1], [0, 1], [0, 1], [0, 1]];

export interface HeatmapMetrics {
    id: number,
    anomaly: number[][],
    contribution: number[][]
};
export type Heatmap = HeatmapMetrics[];

export type Analysis = {
    clients: number[],
    clientSelected: number[],
    anomaly: Metric,
    contribution: Metric,
    filterConcat: MetricValue[],
    anomalyFilter: boolean[],
    contributionFilter: boolean[],
    clientAreas: ClientArea[]
};

export const DEFAULT_ANALYSIS: Analysis = {
    clients: [],
    clientSelected: [],
    anomaly: {
        metrics: DEFAULT_ANOMALY_METRICS,
        scale: DEFAULT_ANOMALY_SCALE,
        value: [],
    },
    contribution: {
        metrics: DEFAULT_CONTRIBUTION_METRICS,
        scale: DEFAULT_CONTRIBUTION_SCALE,
        value: [],
    },
    // anomaly + contribution
    filterConcat: [],
    anomalyFilter: [true, true, true, true, true],
    contributionFilter: [true, true, true, true],
    // clients fill
    clientAreas: []
};
