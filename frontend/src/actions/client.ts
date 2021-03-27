import { ClientRes, ClientState, Metric, RoundPerformanceRes, RoundRes } from '../types';
import { ReduxAction } from './redux-action';

export type ClientAction = InitClientData
  | SetCLientWeight
  | SetClientRoundResAction
  | UpdateClientRoundRes
  | SetAnalysisRound
  | SetAdversaryVisible
  | SetSuggestedAdversary
  | SetHoveredClient
  | AddFavoriteClient
  | RemoveFavoriteClient;

export const INIT_CLIENT_DATA = 'INIT_CLIENT_DATA';
export type InitClientData = ReduxAction<
  typeof INIT_CLIENT_DATA,
  {}
>;

export const SET_CLIENT_WEIGHT = 'SET_CLIENT_WEIGHT';
export type SetCLientWeight = ReduxAction<
  typeof SET_CLIENT_WEIGHT,
  {
    weight: number[]
  }
>;


export const SET_CLIENT_ROUND_RES = 'SET_CLIENT_ROUND_RES';
export type SetClientRoundResAction = ReduxAction<
  typeof SET_CLIENT_ROUND_RES,
  {
    clientRes: ClientRes[],
    clientState: ClientState[]
    roundRes: RoundRes[],
    roundShow: number[],

  }
>;

export const UPDATE_CLIENT_ROUND_RES = 'UPDATE_CLIENT_ROUND_RES';
export type UpdateClientRoundRes = ReduxAction<
  typeof UPDATE_CLIENT_ROUND_RES,
  {
    roundRes: RoundRes[]
  }
>;

export const SET_ANALYSIS_ROUND = 'SET_ANALYSIS_ROUND';
export type SetAnalysisRound = ReduxAction<
  typeof SET_ANALYSIS_ROUND,
  {
    round: number;
  }
>;

export const SET_ADVERSARY_VISIBLE = 'SET_ADVERSARY_VISIBLE';
export type SetAdversaryVisible = ReduxAction<
  typeof SET_ADVERSARY_VISIBLE,
  {
    extend: boolean
  }
>;

export const SET_SUGGESTED_ADVERSARY = 'SET_SUGGESTED_ADVERSARY'
export type SetSuggestedAdversary = ReduxAction<
  typeof SET_SUGGESTED_ADVERSARY,
  {
    suggestedAdversary: Set<number>
  }
>;

export const SET_HOVERED_CLIENT = 'SET_HOVERED_CLIENT'
export type SetHoveredClient = ReduxAction<
  typeof SET_HOVERED_CLIENT,
  {
    hoveredClientId: number | null
  }
>;

export const ADD_FAVORITE_CLIENT = 'ADD_FAVORITE_CLIENT'
export type AddFavoriteClient = ReduxAction<
  typeof ADD_FAVORITE_CLIENT,
  {
    clientId: number
  }
>;

export const REMOVE_FAVORITE_CLIENT = 'REMOVE_FAVORITE_CLIENT'
export type RemoveFavoriteClient = ReduxAction<
  typeof REMOVE_FAVORITE_CLIENT,
  {
    clientId: number
  }
>;



