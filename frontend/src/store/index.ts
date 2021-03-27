import { combineReducers } from 'redux';
import { clientReducer } from './client';
import { analysisReducer } from './analysis';
import { State } from '../types';
import { utilsReducer } from './utils';
import { serverReducer } from './server';
import { featureReducer } from './feature';
import { impactReducer } from './impact';
import { recordReducer } from './record';

export default combineReducers<State>({
  Server: serverReducer,
  Client: clientReducer,
  Analysis: analysisReducer,
  Utils: utilsReducer,
  Feature: featureReducer,
  Impact: impactReducer,
  Record: recordReducer
});
