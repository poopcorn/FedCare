import { ReduxAction } from './redux-action';
import { LayerType,PerformanceRes, DatasetType, ModelType } from '../types';

export type ServerAction =
|SetServerLayer
|SetCurRound
|SetPerformanceData
|GetServerPerformanceErrorAction
|SetPerformanceAuto
|SetServerLatestRoundAction
|ScheduledUpdateServerLatestRoundAction
|SetShowRoundNumAction
|SetDataset
|SetServerModel
|ResetSystemModel;

export const SET_SERVER_LAYER = 'SET_SERVER_LAYER';
export type SetServerLayer = ReduxAction<typeof SET_SERVER_LAYER, {
    layer: LayerType;
}>;

export const SET_CURRENT_ROUND = 'SET_CURRENT_ROUND';
export type SetCurRound = ReduxAction<typeof SET_CURRENT_ROUND, {
    round: number;
}>;

export const SET_PERFORMANCE_DATA = 'SET_PERFORMANCE_DATA';
export type SetPerformanceData = ReduxAction<
  typeof SET_PERFORMANCE_DATA,
  {
    performanceRes:PerformanceRes[];
    roundDisplay: number[],
    test:any;
  }
>;

export const GET_SERVER_PERFORMANCE_ERROR = 'GET_SERVER_PERFORMANCE_ERROR';
export type GetServerPerformanceErrorAction = ReduxAction<
  typeof GET_SERVER_PERFORMANCE_ERROR,
  {
    error: object;
  }
>;

export const SET_PERFORMANCE_AUTO = 'SET_PERFORMANCE_AUTO';
export type SetPerformanceAuto = ReduxAction<
  typeof SET_PERFORMANCE_AUTO,
  {
    auto: boolean;
  }
>;

export const SCHEDULED_UPDATE_SERVER_LATEST_ROUND = 'SCHEDULED_UPDATE_SERVER_LATEST_ROUND';
export type ScheduledUpdateServerLatestRoundAction = ReduxAction<
  typeof SCHEDULED_UPDATE_SERVER_LATEST_ROUND,
  {
    round: number;
    showRoundNum: number;
    auto: boolean;
  }
>;

export const SET_SERVER_LATEST_ROUND = 'SET_SERVER_LATEST_ROUND';
export type SetServerLatestRoundAction = ReduxAction<
  typeof SET_SERVER_LATEST_ROUND,
  {
    serverlatestRound: number;
  }
>;

export const SET_SHOW_ROUND_NUM = 'SET_SHOW_ROUND_NUM';
export type SetShowRoundNumAction = ReduxAction<
  typeof SET_SHOW_ROUND_NUM,
  {
    round: number,
    showRoundNum: number;
  }
>;

export const SET_DATASET = 'SET_DATASET';
export type SetDataset = ReduxAction<
  typeof SET_DATASET,
  {
    dataset: DatasetType
  }
>;

export const SET_SERVER_MODEL = 'SET_SERVER_MODEL';
export type SetServerModel = ReduxAction<
  typeof SET_SERVER_MODEL,
  {
    model: ModelType
  }
>;

export const RESET_SYSTEM_MODEL = 'RESET_SYSTEM_MODEL';
export type ResetSystemModel = ReduxAction<
  typeof RESET_SYSTEM_MODEL,
  {
    totalround: number,
    clientNum: number,
    K: number
  }
>;
