import { Server, DEFAULT_SERVER } from "../types/server";
import {
   ServerAction,
   SET_SERVER_LAYER,
   SET_CURRENT_ROUND,
   SET_PERFORMANCE_DATA,
   GET_SERVER_PERFORMANCE_ERROR,
   SET_PERFORMANCE_AUTO,
   SET_SERVER_LATEST_ROUND,
   SET_SHOW_ROUND_NUM,
   SET_DATASET,
   ResetSystemModel,
   RESET_SYSTEM_MODEL,
   SET_SERVER_MODEL
  } from "../actions";

export const serverReducer = (state: Server = DEFAULT_SERVER, action: ServerAction | ResetSystemModel): Server => {
  switch (action.type) {
    case SET_SERVER_LAYER: {
        return {
          ...state,
          layer: action.payload.layer
        };
    }
    case SET_SERVER_MODEL: {
      return {
        ...state,
        model: action.payload.model
      }
    }
    case SET_CURRENT_ROUND:{
      return {
        ...state,
        round: action.payload.round,
      };
    }
    case SET_PERFORMANCE_DATA: {
      return {
        ...state,
        performanceRes: action.payload.performanceRes.concat(),
        roundDisplay: action.payload.roundDisplay,
        test: action.payload.test
      };
    }
    case GET_SERVER_PERFORMANCE_ERROR: {
      return { ...state, error: action.payload.error };
    }
    case SET_SERVER_LATEST_ROUND: {
      return {
        ...state,
        serverlatestRound: action.payload.serverlatestRound
      };
    }
    case SET_PERFORMANCE_AUTO: {
      return {
        ...state,
        auto: action.payload.auto
      };
    }
    case SET_SHOW_ROUND_NUM: {
      return {
        ...state,
        round: action.payload.round,
        showRoundNum: action.payload.showRoundNum
      };
    }
    case SET_DATASET: {
      return {
        ...state,
        dataset: action.payload.dataset
      };
    }
    case RESET_SYSTEM_MODEL:
      return {
        ...state,
        totalround: action.payload.totalround,
        clientNum: action.payload.clientNum,
      }
    default:
      return state;
  }
}
