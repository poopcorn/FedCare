import { ADD_BEHAVIOR_IMPACT, ADD_GRADIENT_IMPACT, ImpactAction, SET_END_ROUND, SET_IMPACT_ROUND_RANGE, SET_IMPACT_SETTING, SET_SELECTED_ID, SET_START_ROUND, SET_THRESHOLD, UPDATE_IMPACT_VIEW, ResetSystemModel, RESET_SYSTEM_MODEL, IMPACT_ROUND_RES, UPDATE_IMPACT_ROUND_RES } from "../actions";
import { DEFAULT_IMPACT, Impact } from "../types/impact";

export const impactReducer = (state: Impact = DEFAULT_IMPACT, action: ImpactAction | ResetSystemModel): Impact => {
  switch (action.type) {
    case SET_IMPACT_SETTING:
      return {
        ...state,
        clientIds: Array.from(new Set([...state.clientIds, action.payload.clientId])),
        selectedClient: action.payload.clientId,
        roundRange: {
          start: action.payload.start,
          end: action.payload.end
        },
        fetchDataRange: {
          start: action.payload.start,
          end: action.payload.end
        },
        filter: action.payload.filter.concat(),
        threshold: action.payload.threshold
      };
    case UPDATE_IMPACT_VIEW:
      return {
        ...state,
        clientIds: Array.from(new Set([...state.clientIds, action.payload.clientId])),
        selectedClient: action.payload.clientId,
        threshold: action.payload.threshold
      }
    case SET_IMPACT_ROUND_RANGE:
      return {
        ...state,
        roundRange: {
          ...action.payload
        }
      };
    case IMPACT_ROUND_RES: 
      return {
        ...state,
        roundRes: action.payload.roundRes
      };
    case UPDATE_IMPACT_ROUND_RES:
      return {
        ...state,
        roundRes: action.payload.roundRes
      };
    case ADD_GRADIENT_IMPACT:
      return {
        ...state,
        gradient: action.payload.gradient
      };
    case ADD_BEHAVIOR_IMPACT:
      return {
        ...state,
        behavior: action.payload.behavior
      };
    case SET_START_ROUND:
      return {
        ...state,
        roundRange: {
          ...state.roundRange,
          start: action.payload.start
        }
      };
    case SET_END_ROUND:
      return {
        ...state,
        roundRange: {
          ...state.roundRange,
          end: action.payload.end
        }
      };
    case SET_THRESHOLD:
      return {
        ...state,
        threshold: action.payload.threshold
      }
    case RESET_SYSTEM_MODEL:
      return DEFAULT_IMPACT;
    case SET_SELECTED_ID:
      return {
        ...state,
        selectedClient: action.payload.id
      }
    default:
      return state;
  }
}