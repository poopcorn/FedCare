import { CHANGE_IS_FOLD, FeatureAction, ResetSystemModel, RESET_SYSTEM_MODEL, SET_CLIENT_FEATURE, SET_FEATURE_K } from "../actions";
import { DEFAULT_FEATUREMAP, FeatureMap } from "../types";

export const featureReducer = (state: FeatureMap = DEFAULT_FEATUREMAP, action: FeatureAction | ResetSystemModel): FeatureMap => {
  let newFolds: boolean[] = [];
  switch (action.type) {
      case SET_CLIENT_FEATURE:
          return {
            ...state,
            clients: action.payload.clients,
            lastRound: action.payload.lastRound,
            aggregated: action.payload.aggregated,
            cluster: {
              ...state.cluster,
              ...action.payload.cluster
            }
          };
      case CHANGE_IS_FOLD:
        newFolds = state.cluster.isFold.concat();
        newFolds[action.payload.clusterId] = !newFolds[action.payload.clusterId];
        return {
          ...state,
          cluster: {
            ...state.cluster,
            isFold: newFolds
          }
        };
      case SET_FEATURE_K:
        return {
          ...state,
          cluster: {
            ...state.cluster,
            K: action.payload.K
          }
        };
      case RESET_SYSTEM_MODEL:
        return {
          ...DEFAULT_FEATUREMAP, 
          cluster: {
            ...DEFAULT_FEATUREMAP.cluster,
            K: action.payload.K
          }
        };
      default:
          return state;
  }
}