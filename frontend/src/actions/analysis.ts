import { ReduxAction } from "./redux-action";
import { Metric, MetricValue, ClientArea } from "../types";

export type AnalysisAction = (SetAllMetrics | SetProjectionData | SetProjectionColor |  ResetComputeByFilter | SetAnomalyFilter | SetContributionFilter | AddClientsSelected | ClearClientsSelected);

export const SET_ALL_METRICS = 'SET_ALL_METRICS';
export type SetAllMetrics = ReduxAction<typeof SET_ALL_METRICS, {
    anomaly: Metric,
    contribution: Metric,
    clientAreas: ClientArea[]
}>;

export const RESET_COMPUTE_BY_FILTER = 'RESET_COMPUTE_BY_FILTER';
export type ResetComputeByFilter = ReduxAction<typeof RESET_COMPUTE_BY_FILTER, {}>;

export const SET_ANOMALY_FILTER = 'SET_ANOMALY_FILTER';
export type SetAnomalyFilter = ReduxAction<typeof SET_ANOMALY_FILTER, {
    filter: boolean[]
}>;

export const SET_CONTRIBUTION_FILTER = 'SET_CONTRIBUTION_FILTER';
export type SetContributionFilter = ReduxAction<typeof SET_CONTRIBUTION_FILTER, {
    filter: boolean[]
}>;

export const SET_PROJECTION_DATA = 'SET_PROJECTION_DATA';
export type SetProjectionData = ReduxAction<typeof SET_PROJECTION_DATA, {
    filterConcat: MetricValue[],
}>;

export const SET_PROJECTION_COLOR = 'SET_PROJECTION_COLOR';
export type SetProjectionColor = ReduxAction<typeof SET_PROJECTION_COLOR, {
    clientAreas: ClientArea[]
}>;

export const ADD_CLIENTS_SELECTED = 'ADD_CLIENT_SELECTED';
export type AddClientsSelected = ReduxAction<typeof ADD_CLIENTS_SELECTED, {
    clients: number[];
}>;

export const CLEAR_CLIENTS_SELECTED = 'CLEAR_CLIENTS_SELECTED';
export type ClearClientsSelected = ReduxAction<typeof CLEAR_CLIENTS_SELECTED, {}>;
