import { Utils, DEFAULT_UTILS } from '../types';
import { UtilsAction, SET_HIGHLIGHT_ROUND } from '../actions/utils';

export const utilsReducer = (state: Utils = DEFAULT_UTILS, action: UtilsAction): Utils => {
    switch (action.type) {
        case SET_HIGHLIGHT_ROUND:
            return {...state, preRound: state.round, round: action.payload.round, left: action.payload.left ? action.payload.left : -1};
        default:
            return state;
    }
}
