import { call, put, takeLatest, select, all } from 'redux-saga/effects';
import axios from 'axios';
import {
  SET_CLIENT_ROUND_RES,
  SetClientRoundResAction,
  INIT_CLIENT_DATA,
  InitClientData,
  SetCLientWeight,
  SET_CLIENT_WEIGHT,
} from '../client';
import { ClientRes, ClientState, DEFAULT_ANOMALY_METRICS, DEFAULT_ANOMALY_SCALE, DEFAULT_CONTRIBUTION_METRICS, DEFAULT_CONTRIBUTION_SCALE, LayerType, Metric, RoundRes, COMPUTE_TIME_RANGE, COMPUTE_TIME_DIFF } from '../../types';
import { getClientNum, getAnomalyFilter, getContributionFilter, getLayer } from '../../components/utils/selector';
import { SetShowRoundNumAction, SET_SHOW_ROUND_NUM } from '../server';
import { getWeight, get_metrics_by_rounds } from '../../api';
import { transferMetricData } from './analysis';
import { computeClientArea } from '../../components/utils/math';


/**
 * 对后端获取的performance重新进行struct
 * @param performance 后端获取的性能数据
 * @param clientNum 客户端数量
 * @returns clientRes: client性能数据
 * @returns roundShow： 包含了哪写轮次的性能数据
 */
export const getClientPerformanceData = (performance: any, metircs: any, clientNum: number): {
  clientRes: ClientRes[],
  roundShow: number[],
  anomaly: Metric[],
  contribution: Metric[],
} => {
  const clientRes: ClientRes[] = new Array(clientNum).fill(0).map((v, i) => ({
    id:  i,
    performanceRes: []
  }));
  const roundShow = [];
  const anomaly = [];
  const contribution = [];
  for (let r in performance) {
    if (performance.hasOwnProperty(r)) {
      let thisRound = performance[r];
      const round = Number(r);
      const roundIdx = roundShow.length;
      roundShow.push(round);
      // Add metric data
      anomaly.push(transferMetricData(metircs[roundIdx].slice(0, 5), DEFAULT_ANOMALY_METRICS, DEFAULT_ANOMALY_SCALE, clientNum));
      contribution.push(transferMetricData(metircs[roundIdx].slice(5, 9), DEFAULT_CONTRIBUTION_METRICS, DEFAULT_CONTRIBUTION_SCALE, clientNum));
      // Add performance Res
      for (let c in thisRound['train']) {
        if (thisRound['train'].hasOwnProperty(c)) {
          const clientId = Number(c);
          clientRes[clientId].performanceRes.push({
            round: round,
            communicationTime: COMPUTE_TIME_RANGE[0] + Math.random() * COMPUTE_TIME_DIFF,
            train: {
              accuracy: thisRound['train'][c].accuracy,
              loss: thisRound['train'][c].loss
            },
            test: {
              accuracy: thisRound['test'][c].accuracy,
              loss: thisRound['test'][c].loss
            }
          });
        }
      }
    }
  }
  return {clientRes, roundShow, anomaly, contribution};
};

// worker saga
function* displayRoundInputChangeAsync(action: SetShowRoundNumAction) {
  const layer: LayerType = yield select(getLayer);
  const response = yield all([
    call(axios.get,`/performance/?round=${action.payload.round}&number=${action.payload.showRoundNum}`),
    call(get_metrics_by_rounds, {round: action.payload.round, roundNum: action.payload.showRoundNum, layers: layer})
  ]);
  const clientNum: number = yield select(getClientNum);
  const anomalyFilter = yield select(getAnomalyFilter);
  const contributionFilter = yield select(getContributionFilter);

  const { clientRes, roundShow, anomaly, contribution } = getClientPerformanceData(response[0].data, response[1].data, clientNum);
  const roundRes: RoundRes[] = roundShow.map((round, i) => ({
    round,
    clientsArea: computeClientArea(anomaly[i], contribution[i], anomalyFilter, contributionFilter, clientNum),
    anomaly: anomaly[i],
    contribution: contribution[i]
  }));

  const clientState: ClientState[] = clientRes.map(v => ({
    isSelected: false,
    isActivated: false
  }));
  const setClientRoundResAction: SetClientRoundResAction = {
    type: SET_CLIENT_ROUND_RES,
    payload: {
      clientRes,
      clientState,
      roundShow,
      roundRes
    }
  };
  yield put(setClientRoundResAction);
}

function* getClientWeightFunc(action: InitClientData) {
  const weightReturn: any = yield call(getWeight)
  const data = weightReturn.data;
  const clientNum = yield select(getClientNum);
  const weight = new Array(clientNum).fill(0);
  for (let clientId in data) {
    if (data.hasOwnProperty(clientId)) {
      weight[parseInt(clientId)] = data[clientId];
    }
  }
  const setWeightAction: SetCLientWeight = {
    type: SET_CLIENT_WEIGHT,
    payload: {
      weight
    }
  };
  yield put(setWeightAction);
}

// wacther saga
export function* watchGetPerformance() {
  yield takeLatest(SET_SHOW_ROUND_NUM, displayRoundInputChangeAsync);
  yield takeLatest(INIT_CLIENT_DATA, getClientWeightFunc)
}
