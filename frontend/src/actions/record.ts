import { ReduxAction } from './redux-action';
import { NatureType, DecisionType } from '../types/record';

export type RecordAction =
|SetNature
|SetDecision
|SetNatureDecision
|SetWarningVisible
|SetReport;

export const SET_NATURE = 'SET_NATURE';
export type SetNature = ReduxAction<typeof SET_NATURE, {
    nature: NatureType
}>;

export const SET_DECISION = 'SET_DECISION';
export type SetDecision = ReduxAction<typeof SET_DECISION, {
    decision: DecisionType
}>;

export const SET_NATURE_DECISION = 'SET_NATURE_DECISION';
export type SetNatureDecision = ReduxAction<typeof SET_NATURE_DECISION, {
    nature: NatureType,
    decision: DecisionType
}>;

export const SET_WARNING_VISIBLE = 'SET_WARNING_VISIBLE';
export type SetWarningVisible = ReduxAction<typeof SET_WARNING_VISIBLE, {
    warningVisible: boolean
}>;

export const SET_REPORT = 'SET_REPORT';
export type SetReport = ReduxAction<typeof SET_REPORT, {
    nature: NatureType,
    decision: DecisionType,
    warningVisible: boolean
}>;
