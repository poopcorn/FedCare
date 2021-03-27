import { Client, ClientState, DEFAULT_CLIENTS } from '../types';
import {
  ADD_CLIENTS_SELECTED,
  AnalysisAction,
  CLEAR_CLIENTS_SELECTED,
  ClientAction,
  SET_ANALYSIS_ROUND,
  SET_CLIENT_ROUND_RES,
  SET_CLIENT_WEIGHT,
  SET_ADVERSARY_VISIBLE,
  SET_SUGGESTED_ADVERSARY,
  ResetSystemModel,
  RESET_SYSTEM_MODEL,
  SET_HOVERED_CLIENT,
  ADD_FAVORITE_CLIENT,
  REMOVE_FAVORITE_CLIENT,
  UPDATE_CLIENT_ROUND_RES
} from '../actions';

export const clientReducer = (state: Client = DEFAULT_CLIENTS, action: ClientAction | AnalysisAction | ResetSystemModel): Client => {
  let newClientState: ClientState[];
  switch (action.type) {
    case SET_CLIENT_ROUND_RES:
      return {
        ...state,
        clientRes: action.payload.clientRes.concat(),
        clientState: action.payload.clientState,
        roundShow: action.payload.roundShow,
        roundRes: action.payload.roundRes
      };
    case SET_CLIENT_WEIGHT:
      return {
        ...state,
        weight: action.payload.weight.concat()
      }
    case SET_ANALYSIS_ROUND:
      return {
        ...state,
        selectedRound: action.payload.round
      };
    case UPDATE_CLIENT_ROUND_RES:
      return {
        ...state,
        roundRes: action.payload.roundRes
      };
    case ADD_CLIENTS_SELECTED:
      newClientState = state.clientState.map(v => v);
      action.payload.clients.forEach(id => newClientState[id].isSelected = true);
      return {
        ...state,
        clientState: newClientState
      };
    case CLEAR_CLIENTS_SELECTED:
      newClientState = state.clientState.map(v => ({
        isActivated: false,
        isSelected: false
      }));
      return {
        ...state,
        clientState: newClientState
      };
    case SET_ADVERSARY_VISIBLE:
      return {
        ...state,
        extend: action.payload.extend
      };
    case SET_SUGGESTED_ADVERSARY:
      return {
        ...state,
        suggestedAdversary: action.payload.suggestedAdversary
      };
    case RESET_SYSTEM_MODEL:
      return DEFAULT_CLIENTS;
    case SET_HOVERED_CLIENT:
      return {
        ...state,
        hoveredClientId: action.payload.hoveredClientId
      };
    case ADD_FAVORITE_CLIENT:
      state.favoriteClietnIds.add(action.payload.clientId)
      return {
        ...state,
        favoriteClietnIds: new Set(Array.from(state.favoriteClietnIds))
      };
    case REMOVE_FAVORITE_CLIENT:
      state.favoriteClietnIds.delete(action.payload.clientId)
      return {
        ...state,
        favoriteClietnIds: new Set(Array.from(state.favoriteClietnIds))
      };
    default:
      return state;
  }
};
