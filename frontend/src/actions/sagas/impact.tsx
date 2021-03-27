import axios from 'axios';
import { all, select, takeLatest, call, put } from "redux-saga/effects";
import { getGraidentTsne, getMultipleInfo, get_metrics_by_rounds } from "../../api";
import { getAnomalyFilter, getClientNum, getContributionFilter, getImpactSetting, getLayer } from "../../components/utils/selector";
import { AddBehaviorImpact, ADD_BEHAVIOR_IMPACT, AddGradientImpact, ADD_GRADIENT_IMPACT, ImpactCompute, IMPACT_COMPUTE, SetImpactSetting, SET_IMPACT_SETTING, UpdateImpactView, UPDATE_IMPACT_VIEW, ImpactRoundRes, IMPACT_ROUND_RES } from "../impact";
import { computeClientArea, getPositionMinMax } from "../../components/utils/math";
import { LayerType, RoundRange, RoundRes } from "../../types";
import { getClientPerformanceData } from './client';


const getTsnePosition = (tsneData: any) => {
  const position: number[][][] = tsneData['position'];
  const avgTsne: number[][] = tsneData['avgPos'];
  const allPosition = [];
  position.forEach(v => allPosition.push(...v));
  allPosition.push(...avgTsne);
  const domain = getPositionMinMax(allPosition);
  return {
    position,
    avgTsne,
    domain
  };
}

// round范围相同，layer相同 并且filter也相同没有必要再次向后端获取数据
// 除了性能考虑外，防止只修改clientId，导致tsne布局重算的问题
// @TODO 如果另加一个数据集，这里还要加数据集是否相同的判断
function* isSameSetting(action: ImpactCompute) {
  const { start, end } = action.payload;
  const layer = yield select(getLayer);
  const anomalyFilter = yield select(getAnomalyFilter);
  const contributionFilter = yield select(getContributionFilter);
  const filter: boolean[] = [];
  filter.push(...anomalyFilter, ...contributionFilter);  
  const setting: {
    roundRange: RoundRange,
    layer: LayerType,
    filter: boolean[]
  } = yield select(getImpactSetting);
  let isSameFilter = true;
  for (let i = 0; i < filter.length; i++) {
    if (filter[i] != setting.filter[i]) {
      isSameFilter = false;
      break;
    }
  }
  // JUST UPDATE
  if (setting.layer == layer && setting.roundRange.start === start && setting.roundRange.end == end && isSameFilter) {
    const updateImpactAction: UpdateImpactView = {
      type: UPDATE_IMPACT_VIEW,
      payload: {
        clientId: action.payload.clientId,
        threshold: action.payload.threshold
      }
    };
    yield put(updateImpactAction);
    return;
  }
  // FETCH BACKEND DATA AND UPDATE
  const setImpactSettingAction: SetImpactSetting = {
    type: SET_IMPACT_SETTING,
    payload: {
      ...action.payload,
      filter
    }
  };
  yield put(setImpactSettingAction);
}

function* requestImpact(action: SetImpactSetting) {
  const { start, end } = action.payload;
  const layer = yield select(getLayer);
  const filter = action.payload.filter.map(v => v ? 1 : 0);
  const response = yield all([
    call(getGraidentTsne, { start, end, layer}),
    call(getMultipleInfo, 
      {start: action.payload.start, end: end, layer: layer, filter: filter}),
    call(axios.get,`/performance/?round=${end}&number=${end - start + 1}`),
    call(get_metrics_by_rounds, {round: end, roundNum: end - start + 1, layers: layer})
  ]);

  // set roundRes
  const clientNum: number = yield select(getClientNum);
  const anomalyFilter = yield select(getAnomalyFilter);
  const contributionFilter = yield select(getContributionFilter);
  const { clientRes, roundShow, anomaly, contribution } = getClientPerformanceData(response[2].data, response[3].data, clientNum);
  const roundRes: RoundRes[] = roundShow.map((round, i) => ({
    round,
    clientsArea: computeClientArea(anomaly[i], contribution[i], anomalyFilter, contributionFilter, clientNum),
    anomaly: anomaly[i],
    contribution: contribution[i]
  }));
  const impactRoundResAction: ImpactRoundRes = {
    type: IMPACT_ROUND_RES,
    payload: {
      roundRes
    }
  };
  yield put(impactRoundResAction);

  // gradient data transfer
  const gradientData = response[0].data.res;
  const gradientPostionData = getTsnePosition(gradientData);
  const addGradientImpactAction: AddGradientImpact = {
    type: ADD_GRADIENT_IMPACT,
    payload: {
      gradient: {
        ...gradientPostionData,
        diff: gradientData['diff'],
      }
    }
  };
  yield put(addGradientImpactAction);

  // gradient data transfer
  const data = response[1].data.res;
  const behaviorData = data['tsne'];
  const behaviorPostionData = getTsnePosition(behaviorData);
  const addBehaviorImpactAction: AddBehaviorImpact = {
    type: ADD_BEHAVIOR_IMPACT,
    payload: {
      behavior: {
        ...behaviorPostionData,
        multiple: data['multipleInfo']
      }
    }
  };
  yield put(addBehaviorImpactAction);
}


export function* watchImpactRound() {
  yield takeLatest(IMPACT_COMPUTE, isSameSetting);
  yield takeLatest(SET_IMPACT_SETTING, requestImpact);
}