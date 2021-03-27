import { takeLatest, call, put, select } from 'redux-saga/effects';
import { getGradientByRound } from '../../api';
import { SetCurRound } from '../server';
import { DEFAULT_CLUSTER_CLIENT } from '../../types';
import { SET_ANALYSIS_ROUND } from '../client';
import {
  AggregatedFeatureMap,
  ClientFeatureMap,
  FeatureCluster,
  OneLayer
} from '../../types/feature';
import { kmeans } from '../../components/utils/kmeans';
import { euclideanDis } from '../../components/utils/math';
import { getFeatureK, getSelectedRound } from '../../components/utils/selector';
import { SetFeatureMap, SET_CLIENT_FEATURE, SET_FEATURE_K } from '../feature';

const transferFeatureMapToArray = (data: OneLayer[]): number[][] => {
  const res: number[][] = [];
  data.forEach((channelData) => {
    const oneChannel: number[] = [];
    channelData.forEach((subData) => {
      oneChannel.push(...subData);
    });
    res.push(oneChannel);
  });
  return res;
};

const arrayDiff = (a: number[], b: number[]): number[] => {
  const minLength = Math.min(a.length, b.length);
  return new Array(minLength).fill(0).map((v, i) => a[i] - b[i]);
};

const get2DimArrayScale = (data: number[][]): number[] => {
  let min = data[0][0],
    max = data[0][0];
  data.forEach((v) => {
    min = Math.min(min, ...v);
    max = Math.max(max, ...v);
  });
  return [min, max];
};

// 计算某个Client的差值结果
const getRes = (
  preFeature: ClientFeatureMap,
  curFeature: ClientFeatureMap,
  avgFeature: AggregatedFeatureMap
) => {
  const objectCurArray = {
    layer1: transferFeatureMapToArray(curFeature.layer1),
    layer2: transferFeatureMapToArray(curFeature.layer2)
  };
  const objectPreArray = {
    layer1: transferFeatureMapToArray(preFeature.layer1),
    layer2: transferFeatureMapToArray(preFeature.layer2)
  };
  const avgArray = {
    layer1: transferFeatureMapToArray(avgFeature.layer1),
    layer2: transferFeatureMapToArray(avgFeature.layer2)
  };
  const preDiffData = {
    layer1: objectCurArray.layer1.map((curV, i) => arrayDiff(curV, objectPreArray.layer1[i])),
    layer2: objectCurArray.layer2.map((curV, i) => arrayDiff(curV, objectPreArray.layer2[i]))
  };
  const avgDiffData = {
    layer1: objectCurArray.layer1.map((curV, i) => arrayDiff(curV, avgArray.layer1[i])),
    layer2: objectCurArray.layer2.map((curV, i) => arrayDiff(curV, avgArray.layer2[i]))
  };
  return {
    preDiffData,
    avgDiffData,
    curData: objectCurArray
  };
};

// 计算所有client差值的scale，并且挑选其中一个client的聚类结果作为所有的聚类结果
const clusterK = (
  preFeature: ClientFeatureMap[],
  curFeature: ClientFeatureMap[],
  avgFeature: AggregatedFeatureMap,
  k: number
): FeatureCluster => {
  let scaleRes = {
    LastRound: {
      layer1: [0],
      layer2: [0]
    },
    Aggregate: {
      layer1: [0],
      layer2: [0]
    },
    Cur: {
      layer1: [0],
      layer2: [0]
    }
  };
  // calculate all client's diff to get scale
  const num = curFeature.length;
  const diffData = [];
  for (let i = 0; i < num; i++) {
    const res = getRes(preFeature[i], curFeature[i], avgFeature);
    diffData.push(res);
    scaleRes.LastRound.layer1.push(...get2DimArrayScale(res.preDiffData.layer1));
    scaleRes.LastRound.layer2.push(...get2DimArrayScale(res.preDiffData.layer2));
    scaleRes.Aggregate.layer1.push(...get2DimArrayScale(res.avgDiffData.layer1));
    scaleRes.Aggregate.layer2.push(...get2DimArrayScale(res.avgDiffData.layer2));
    scaleRes.Cur.layer1.push(...get2DimArrayScale(res.curData.layer1));
    scaleRes.Cur.layer2.push(...get2DimArrayScale(res.curData.layer2));
  }
  // return default kmeans and scale
  return {
    K: k,
    isFold: new Array(k).fill(true),
    LastRound: {
      layer1: kmeans(diffData[0].preDiffData.layer1, euclideanDis, k),
      layer2: kmeans(diffData[DEFAULT_CLUSTER_CLIENT].preDiffData.layer2, euclideanDis, k),
      scale: {
        layer1: [Math.min(...scaleRes.LastRound.layer1), Math.max(...scaleRes.LastRound.layer1)],
        layer2: [Math.min(...scaleRes.LastRound.layer2), Math.max(...scaleRes.LastRound.layer2)]
      }
    },
    Aggregated: {
      layer1: kmeans(diffData[DEFAULT_CLUSTER_CLIENT].avgDiffData.layer1, euclideanDis, k),
      layer2: kmeans(diffData[DEFAULT_CLUSTER_CLIENT].avgDiffData.layer2, euclideanDis, k),
      scale: {
        layer1: [Math.min(...scaleRes.Aggregate.layer1), Math.max(...scaleRes.Aggregate.layer1)],
        layer2: [Math.min(...scaleRes.Aggregate.layer2), Math.max(...scaleRes.Aggregate.layer2)]
      }
    },
    Current: {
      layer1: kmeans(diffData[DEFAULT_CLUSTER_CLIENT].curData.layer1, euclideanDis, k),
      layer2: kmeans(diffData[DEFAULT_CLUSTER_CLIENT].curData.layer2, euclideanDis, k),
      scale: {
        layer1: [Math.min(...scaleRes.Cur.layer1), Math.max(...scaleRes.Cur.layer1)],
        layer2: [Math.min(...scaleRes.Cur.layer2), Math.max(...scaleRes.Cur.layer2)]
      }
    }
  };
};

function* requestFeature(action: SetCurRound): any {
  const round = action.payload.round ? action.payload.round : yield select(getSelectedRound);
  const response = yield call(getGradientByRound, round);
  const data = response.data;
  const preFeature: ClientFeatureMap[] = data.last;
  const curFeature: ClientFeatureMap[] = data.cur;
  const avgFeature: AggregatedFeatureMap = data.avg;

  // calculate K-means
  const K = yield select(getFeatureK);
  const kMeansRes = clusterK(preFeature, curFeature, avgFeature, K);

  const setFeatureMapAction: SetFeatureMap = {
    type: SET_CLIENT_FEATURE,
    payload: {
      clients: curFeature,
      lastRound: preFeature,
      aggregated: avgFeature,
      cluster: {
        isFold: kMeansRes.isFold,
        LastRound: kMeansRes.LastRound,
        Aggregated: kMeansRes.Aggregated,
        Current: kMeansRes.Current
      }
    }
  };
  yield put(setFeatureMapAction);
}

export function* watchFeatureRound() {
  yield takeLatest(SET_ANALYSIS_ROUND, requestFeature);
  yield takeLatest(SET_FEATURE_K, requestFeature);
}
