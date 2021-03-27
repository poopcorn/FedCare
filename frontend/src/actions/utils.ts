import { ReduxAction } from "./redux-action";

export type UtilsAction = SetHightlightRound;

export const SET_HIGHLIGHT_ROUND = 'SET_HIGHLIGHT_ROUND';
export type SetHightlightRound = ReduxAction<typeof SET_HIGHLIGHT_ROUND, {
    round: number,
    left?: number
}>;

export const SET_CLIENT_OFFSET_Y = 'SET_CLIENT_OFFSET_Y';
export type SetClientOffsetY = ReduxAction<typeof SET_CLIENT_OFFSET_Y, {
    offsetY: number
}>;
