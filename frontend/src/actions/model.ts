import { ReduxAction } from './redux-action';

export type ModelAction =
|SetClientNum;

export const SET_CLIENTNUM = 'SET_CLIENTNUM';
export type SetClientNum = ReduxAction<typeof SET_CLIENTNUM, {
    clientNum: number
}>;
