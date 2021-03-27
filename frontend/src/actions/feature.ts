import { AggregatedFeatureMap, ClientFeatureMap, LayerCluster } from "../types/feature";
import { ReduxAction } from "./redux-action";

export type FeatureAction = SetFeatureMap | SetShowClient | SetFeatureCluster | SetFeatureK | ChangeIsFold;

export const SET_CLIENT_FEATURE = 'SET_CLIENT_FEATURE';
export type SetFeatureMap = ReduxAction<typeof SET_CLIENT_FEATURE, {
  clients: ClientFeatureMap[],
  lastRound: ClientFeatureMap[],
  aggregated: AggregatedFeatureMap,
  cluster: {
    isFold: boolean[],
    LastRound: LayerCluster,
    Aggregated: LayerCluster,
    Current: LayerCluster
  }
}>;

export const Add_FEATURE_CLIENTS = 'ADD_FEATURE_CLIENTS';
export type AddFeatureClients = ReduxAction<typeof Add_FEATURE_CLIENTS, {
  client: ClientFeatureMap[]
}>;

export const SET_SHOW_CLIENT = 'SET_SHOW_CLIENT';
export type SetShowClient = ReduxAction<typeof SET_SHOW_CLIENT, {
  curClientId: number
}>;

export const SET_FEATURE_K = 'SET_FEATURE_K';
export type SetFeatureK = ReduxAction<typeof SET_FEATURE_K, {
  K: number
}>;

export const SET_FEATURE_CLUSTER = 'SET_FEATURE_CLUSTER';
export type SetFeatureCluster = ReduxAction<typeof SET_FEATURE_CLUSTER, {
  LastRound: LayerCluster,
  Aggregated: LayerCluster
}>;

export const CHANGE_IS_FOLD = 'CHANGE_IS_FOLD';
export type ChangeIsFold = ReduxAction<typeof CHANGE_IS_FOLD, {
  clusterId: number
}>;
