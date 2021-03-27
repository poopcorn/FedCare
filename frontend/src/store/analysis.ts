import { Analysis, DEFAULT_ANALYSIS } from "../types";
import { AnalysisAction, SET_ANOMALY_FILTER, SET_CONTRIBUTION_FILTER, ADD_CLIENTS_SELECTED, CLEAR_CLIENTS_SELECTED, SET_ALL_METRICS, SET_PROJECTION_DATA, ResetSystemModel, RESET_SYSTEM_MODEL, SET_PROJECTION_COLOR } from "../actions";

export const analysisReducer = (state: Analysis = DEFAULT_ANALYSIS, action: AnalysisAction | ResetSystemModel): Analysis => {
    switch (action.type) {
        case SET_ALL_METRICS:
            return {...state, anomaly: action.payload.anomaly, contribution: action.payload.contribution, clientAreas: action.payload.clientAreas};
        case SET_PROJECTION_DATA:
            return {...state, filterConcat: action.payload.filterConcat};
        case SET_ANOMALY_FILTER:
            return {...state, anomalyFilter: action.payload.filter};
        case SET_CONTRIBUTION_FILTER:
            return {...state, contributionFilter: action.payload.filter};
        case ADD_CLIENTS_SELECTED:
            return {...state, clientSelected: Array.from(new Set([...state.clientSelected, ...action.payload.clients]))};
        case CLEAR_CLIENTS_SELECTED:
            return {...state, clientSelected: []};
        case SET_PROJECTION_COLOR:
            return {...state, clientAreas: action.payload.clientAreas}
        case RESET_SYSTEM_MODEL:
            return DEFAULT_ANALYSIS;
        default:
            return state;
    }
}
