import { all, fork } from 'redux-saga/effects';
import { watchGetPerformance } from './client';
import {watchGetPerformanceWAG}from './server'
import { watchAnalyseRound, wacthMetricChange, watchFilterChange } from './analysis';
import { watchFeatureRound } from './feature';
import { watchImpactRound } from './impact';

export default function* root(): any {
  yield all([
    fork(watchGetPerformance),
    fork(watchAnalyseRound), 
    fork(wacthMetricChange),
    fork(watchFilterChange),
    fork(watchGetPerformanceWAG),
    fork(watchFeatureRound),
    fork(watchImpactRound)
  ]
  );
};
