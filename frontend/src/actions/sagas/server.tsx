import { call, put, all,takeLatest, select } from 'redux-saga/effects';
import axios from 'axios';
import{
  ScheduledUpdateServerLatestRoundAction,
  SCHEDULED_UPDATE_SERVER_LATEST_ROUND,
  SET_PERFORMANCE_DATA,
  SetPerformanceData,
  SetCurRound,
  SET_CURRENT_ROUND,
  GET_SERVER_PERFORMANCE_ERROR,
  GetServerPerformanceErrorAction,
  SetServerLatestRoundAction,
  SET_SERVER_LATEST_ROUND,
  SetShowRoundNumAction,
  SET_SHOW_ROUND_NUM,
  SET_DATASET,
  SetDataset,
  ResetSystemModel,
  RESET_SYSTEM_MODEL,
  SET_SERVER_LAYER,
  SetServerLayer,
  SET_SERVER_MODEL
}from '../server';
import { DatasetType, PerformanceRes,STrainRes } from '../../types';
import { getDataset, getLayer, getModel, getTotalRound} from '../../components/utils/selector';
import { SwitchDataset } from '../../api';
import {
  INIT_CLIENT_DATA,
  InitClientData, } from '..';

/**
 * 对后端获取的performance重新进行struct
 * @param performance 后端获取的性能数据
 * @param totalRounds 总轮数
 * @returns roundAllClientRes: 某一轮的客户端性能数据
 * @returns roundDisplay： 包含了哪写轮次的性能数据
 */

 //获取所有轮次所有client*权重数据
export const getClientPerformanceData = (performance: any, weight: any, roundNum :number): {
  roundDisplay: number[],
  performanceRes:  PerformanceRes[],
} => {
  const k: STrainRes={accuracy: 0, loss: 0};
  const performanceRes: PerformanceRes[] = new Array(roundNum).fill(0).map((v, i) => ({
    round:  i,
    trainWAG: k,
    testWAG: k,
  }));
  const roundDisplay = [];
  for (let r in performance) {
    if (performance.hasOwnProperty(r)) {
      let thisRound = performance[r];//获取r轮所有客户端数据
      const round = Number(r);
      //const index=round + roundNum - curRound - 1;
      roundDisplay.push(round);
      let trainacc: number = 0;
      let trainloss: number = 0;
      let testacc: number = 0;
      let testloss: number = 0;
      for (let c in thisRound['train']) {//循环遍历r轮的client
        const weightNum = Number(weight[c]);
        //加权平均
        trainacc += (thisRound['train'][c].accuracy*weightNum);
        trainloss += (thisRound['train'][c].loss*weightNum);
        testacc += (thisRound['test'][c].accuracy*weightNum);
        testloss += (thisRound['test'][c].loss*weightNum);
      }
      performanceRes[round - 1]=({
        round: round,
        trainWAG: {
          accuracy: trainacc,
          loss: trainloss
        },
        testWAG: {
          accuracy: testacc,
          loss: testloss
        }
      });
    }
  }
  return {roundDisplay, performanceRes};
};

// worker saga
function* ScheduledUpdateCurrentRoundAsync(action: ScheduledUpdateServerLatestRoundAction) {
  try {
    const roundNum = yield select(getTotalRound);//获得轮次总数
    // const curRound = yield select(getSpaceRound);//获得当前轮数
    const responseAll=yield all([
      call(axios.get, `/performance/?round=${roundNum}&number=${roundNum}`),
      call(axios.get, `/weight`)
    ])
    const { roundDisplay, performanceRes } = getClientPerformanceData(responseAll[0].data, responseAll[1].data, roundNum);
    // 自动更新的时候，更改当前数据
    if (action.payload.auto) {
      const SetPerformanceDataAction: SetPerformanceData = {
        type: SET_PERFORMANCE_DATA,
        payload: {
          performanceRes,
          roundDisplay,
          test: responseAll[0].data
        }
      };
      yield put(SetPerformanceDataAction);
    }
    // 轮询的时候，不断更新显示的 latest round（无数据，不更新）
    if (performanceRes.length > 0) {
      const setServerLatestRound: SetServerLatestRoundAction = {
        type: SET_SERVER_LATEST_ROUND,
        payload: {
          serverlatestRound: action.payload.round
        }
      };
      yield put(setServerLatestRound);
      // 自动更新的时候，修改 display round
      if (action.payload.auto) {
        const setCurrentRound: SetCurRound = {
          type: SET_CURRENT_ROUND,
          payload: {
            round: action.payload.round
          }
        };
        yield put(setCurrentRound);
      }
    }
    }
    catch (e) {
    const errorAction: GetServerPerformanceErrorAction = {
      type: GET_SERVER_PERFORMANCE_ERROR,
      payload: {
        error: e
      }
    };
    yield put(errorAction);
  }
}

function* RoundInputChangeAsync(action: SetShowRoundNumAction) {
  try {
    const roundNum = yield select(getTotalRound);//获得轮次总数
    // const curRound = yield select(getSpaceRound);//获得当前轮数
    const responseAll = yield all([
        // call(axios.get, `/performance/?round=${action.payload.round}&number=${action.payload.showRoundNum ||
        //   DEFAULT_PERFORMANCE_NUMBER}`),
        call(axios.get, `/performance/?round=${roundNum}&number=${roundNum}`),
        call(axios.get, `/weight`)
    ]);
    const { performanceRes, roundDisplay } = getClientPerformanceData(responseAll[0].data, responseAll[1].data, roundNum);
    const SetPerformanceDataAction: SetPerformanceData = {
      type: SET_PERFORMANCE_DATA,
      payload: {
        performanceRes,
        roundDisplay,
        test: responseAll[0].data
      }
    };
    yield put(SetPerformanceDataAction);
  } catch (e) {
    const errorAction: GetServerPerformanceErrorAction = {
      type: GET_SERVER_PERFORMANCE_ERROR,
      payload: {
        error: e
      }
    };
    yield put(errorAction);
  }
  const setCurrentRound: SetCurRound = {
    type: SET_CURRENT_ROUND,
    payload: {
      round: action.payload.round
    }
  };
  yield put(setCurrentRound);
}

//请求新的数据集函数
function* SwitchDatasetAsync(action: SetDataset) {
  const layer = yield select(getLayer);
  const model = yield select(getModel);
  if (layer == 'none' || model == 'none') {
    return;
  }
  const response = yield call(SwitchDataset, {dataset: action.payload.dataset});
  const data = response.data;
  const resetSystemModelAction: ResetSystemModel = {
    type: RESET_SYSTEM_MODEL,
    payload: {
      totalround: data['Define_round_num'],
      clientNum: data['Define_client_number'],
      K: action.payload.dataset === 'FEMNIST' ? 5 : 2
    }
  }
  yield put(resetSystemModelAction);

  // REFETCH CLIENT WEIGHT
  const initClientData: InitClientData = {
    type: INIT_CLIENT_DATA,
    payload: {

    }
  };
  yield put(initClientData);

  // SHOW CLIENT
  const setShowRoundNumAction: SetShowRoundNumAction = {
    type: SET_SHOW_ROUND_NUM,
    payload: {
      round: 20,
      showRoundNum:20
    }
  };
  yield put(setShowRoundNumAction);
}

function* SwitchLayerAsync() {
  const dataset: DatasetType = yield select(getDataset);
  if (dataset == 'DIGIT5' || dataset == 'FEMNIST') {
    const setDataset: SetDataset = {
      type: SET_DATASET,
      payload: {
        dataset
      }
    };
    yield put(setDataset);
  }
}

// wacther saga
export function* watchGetPerformanceWAG() {
  yield takeLatest(SCHEDULED_UPDATE_SERVER_LATEST_ROUND, ScheduledUpdateCurrentRoundAsync);
  yield takeLatest(SET_SHOW_ROUND_NUM, RoundInputChangeAsync);
  yield takeLatest(SET_DATASET, SwitchDatasetAsync);
  yield takeLatest(SET_SERVER_LAYER, SwitchLayerAsync);
  yield takeLatest(SET_SERVER_MODEL, SwitchLayerAsync);
}
