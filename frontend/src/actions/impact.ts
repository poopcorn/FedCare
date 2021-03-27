import { RoundRes } from "../types";
import { BehaviorImpact, GradientImpact } from "../types/impact";
import { ReduxAction } from "./redux-action";

export type ImpactAction = ImpactCompute | AddGradientImpact | AddBehaviorImpact | SetStartRound | SetEndRound | SetImpactRoundRange | SetThreshold | SetImpactSetting | UpdateImpactView | SetSelectedId | ImpactRoundRes | UpdateImpactRoundRes;

export const SET_IMPACT_SETTING = 'SET_IMPACT_SETTING';
export type SetImpactSetting = ReduxAction<
  typeof SET_IMPACT_SETTING,
  {
    start: number,
    end: number,
    clientId: number,
    threshold: number,
    filter: boolean[]
  }
>;
export const SET_IMPACT_ROUND_RANGE = 'SET_IMPACT_ROUND_RANGE';
export type SetImpactRoundRange = ReduxAction<
  typeof SET_IMPACT_ROUND_RANGE,
  {
    start: number,
    end: number
  }
>;

export const IMPACT_COMPUTE = 'IMPACT_COMPUTE';
export type ImpactCompute = ReduxAction<
  typeof IMPACT_COMPUTE,
  {
    start: number,
    end: number,
    clientId: number,
    threshold: number,
  }
>;

export const IMPACT_ROUND_RES = 'IMPACT_ROUND_RES';
export type ImpactRoundRes = ReduxAction<
  typeof IMPACT_ROUND_RES,
  {
    roundRes: RoundRes[]
  }
>;

export const UPDATE_IMPACT_ROUND_RES = 'UPDATE_IMPACT_ROUND_RES';
export type UpdateImpactRoundRes = ReduxAction<
  typeof UPDATE_IMPACT_ROUND_RES,
  {
    roundRes: RoundRes[]
  }
>;

export const ADD_GRADIENT_IMPACT = 'ADD_CLIENT_IMPACT';
export type AddGradientImpact = ReduxAction<
  typeof ADD_GRADIENT_IMPACT,
  {
    gradient: GradientImpact,
  }
>;

export const ADD_BEHAVIOR_IMPACT = 'ADD_BEHAVIOR_IMPACT';
export type AddBehaviorImpact = ReduxAction<
  typeof ADD_BEHAVIOR_IMPACT,
  {
    behavior: BehaviorImpact
  }
>;

export const SET_START_ROUND = 'SET_START_ROUND';
export type SetStartRound = ReduxAction<
  typeof SET_START_ROUND,
  {
    start: number
  }
>;

export const SET_END_ROUND = 'SET_END_ROUND';
export type SetEndRound = ReduxAction<
  typeof SET_END_ROUND,
  {
    end: number
  }
>;

export const SET_THRESHOLD = 'SET_THRESHOLD';
export type SetThreshold = ReduxAction<
  typeof SET_THRESHOLD,
  {
    threshold: number
  }
>;

export const UPDATE_IMPACT_VIEW = 'SET_IMPACT_VIEW';
export type UpdateImpactView = ReduxAction<
  typeof UPDATE_IMPACT_VIEW,
  {
    clientId: number,
    threshold: number
  }
>;

export const SET_SELECTED_ID = 'SET_SELECTED_ID';
export type SetSelectedId = ReduxAction<
  typeof SET_SELECTED_ID,
  {
    id: number
  }
>;