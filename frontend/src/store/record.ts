import { Record, DEFAULT_RECORD } from "../types/record";
import {
   RecordAction,
   SET_NATURE,
   SET_DECISION,
   SET_NATURE_DECISION,
   SET_WARNING_VISIBLE,
   SET_REPORT
  } from "../actions/record";
import { ResetSystemModel, RESET_SYSTEM_MODEL } from "../actions";

export const recordReducer = (state: Record = DEFAULT_RECORD, action: RecordAction | ResetSystemModel): Record => {
  switch (action.type) {
    case SET_NATURE: {
        return {
          ...state,
          nature: action.payload.nature
        };
    }
    case SET_DECISION:{
      return {
        ...state,
        decision: action.payload.decision
      };
    }
    case SET_NATURE_DECISION:{
      return {
        ...state,
        nature: action.payload.nature,
        decision: action.payload.decision
      };
    }
    case SET_WARNING_VISIBLE:{
      return {
        ...state,
        warningVisible: action.payload.warningVisible,
      };
    }
    case SET_REPORT:{
      return {
        ...state,
        nature: action.payload.nature,
        decision: action.payload.decision,
        warningVisible: action.payload.warningVisible,
      };
    }
    case RESET_SYSTEM_MODEL:
      return DEFAULT_RECORD;
    default:
      return state;
  }
}
