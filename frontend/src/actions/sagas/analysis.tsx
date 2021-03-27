import { put, takeLatest, select } from 'redux-saga/effects';
import { SET_ANOMALY_FILTER, SET_CONTRIBUTION_FILTER,  RESET_COMPUTE_BY_FILTER, ResetComputeByFilter, SET_ALL_METRICS, SET_PROJECTION_DATA, SetProjectionData, SET_PROJECTION_COLOR, SetProjectionColor } from '../analysis';
import { getClientNum, getAnomaly, getContribution, getAnomalyFilter, getContributionFilter, getRoundRes, getClientRound, getImpactRoundRes } from '../../components/utils/selector';
import { ClientArea, Metric, MetricValue, RoundRes } from '../../types';
import { computeClientArea } from '../../components/utils/math';
import { SetAnalysisRound, SET_ANALYSIS_ROUND, UpdateClientRoundRes, UPDATE_CLIENT_ROUND_RES } from '../client';
import { UpdateImpactRoundRes, UPDATE_IMPACT_ROUND_RES } from '../impact';

export const transferMetricData = (spaceRes: any, metrics: string[], scale: number[][], clientNum: number): Metric => {
    const res: Metric = {
        metrics: metrics.concat(),
        scale: scale,
        value: new Array(clientNum).fill(0).map((v, index) => {return {
            id: index,
            vector: []
        }})
    };
    metrics.forEach((v, i) => {
        const data = spaceRes[i];
        for (let key in data) {
            if (data.hasOwnProperty(key)) {
                res.value[+key].vector.push(data[+key]);
            }
        }
    });
    return res;
}

function* requestMetric(action: SetAnalysisRound): any {
    const roundRes: RoundRes[] = yield select(getRoundRes);
    const curRoundRes = roundRes.filter(v => v.round == action.payload.round);
    const metricAction = {
        type: SET_ALL_METRICS,
        payload: {
            anomaly: curRoundRes[0].anomaly,
            contribution: curRoundRes[0].contribution,
            clientsFill: curRoundRes[0].clientsArea
        }
    }
    yield put(metricAction);

    // reset filter and compute client fill
    yield activateFilterAciton();
}
// wacther saga
export function* watchAnalyseRound() {
    yield takeLatest(SET_ANALYSIS_ROUND, requestMetric)
}

// 因为filter的改变，需要改变与clientArea相关的所有内容，包括client视图中的外框颜色\Impact视图颜色\投影试图
function* resetClientFill(action: ResetComputeByFilter): any {
    const roundShow: number[] = yield select(getClientRound);
    const roundRes: RoundRes[] = yield select(getRoundRes);
    const impactRoundRes: RoundRes[] = yield select(getImpactRoundRes);
    const anomalyFilter = yield select(getAnomalyFilter);
    const contributionFilter = yield select(getContributionFilter);
    const clientNum: number = yield select(getClientNum);
    const anomaly: Metric = yield select(getAnomaly);
    const contribute: Metric = yield select(getContribution);
    const filterConcat: MetricValue[] = [];
    const clientCnt = anomaly.value.length;
    for (let index = 0; index < clientCnt; index++) {
        const aVector = anomaly.value[index].vector.filter((v, metricId) => anomalyFilter[metricId]);
        const cVector = contribute.value[index].vector.filter((v, metricId) => contributionFilter[metricId]);
        filterConcat.push({
            id: anomaly.value[index].id,
            vector: aVector.concat(cVector)
        });
    }
    const newRoundRes: RoundRes[] = roundShow.map((round, i) => ({
        ...roundRes[i],
        clientsArea: computeClientArea(roundRes[i].anomaly, roundRes[i].contribution, anomalyFilter, contributionFilter, clientNum),
    }));
    
    const newImpactRoundRes: RoundRes[] = impactRoundRes.map((round, i) => ({
        ...impactRoundRes[i],
        clientsArea: computeClientArea(impactRoundRes[i].anomaly, impactRoundRes[i].contribution, anomalyFilter, contributionFilter, clientNum),
    }));

    if (anomaly.value.length && contribute.value.length) {
        const projectionClientsArea: ClientArea[] = computeClientArea(anomaly, contribute, anomalyFilter, contributionFilter, clientNum);
        const updateProjectionColor: SetProjectionColor  = {
            type: SET_PROJECTION_COLOR,
            payload: {
                clientAreas: projectionClientsArea
            }
        };
        yield put(updateProjectionColor);
    }
    
    const updateRoundResAction: UpdateClientRoundRes = {
        type: UPDATE_CLIENT_ROUND_RES,
        payload: {
            roundRes: newRoundRes
        }
    };
    yield put(updateRoundResAction);

    const updateImpactRoundResAction: UpdateImpactRoundRes = {
        type: UPDATE_IMPACT_ROUND_RES,
        payload: {
            roundRes: newImpactRoundRes
        }
    };
    yield put(updateImpactRoundResAction);
    
    const ProjectionAction: SetProjectionData = {
        type: SET_PROJECTION_DATA,
        payload: {
            filterConcat: filterConcat,
        }
    };
    yield put(ProjectionAction);
}
export function* wacthMetricChange() {
    yield takeLatest(RESET_COMPUTE_BY_FILTER, resetClientFill);
}

// reset filter and compute client fill
function* activateFilterAciton(): any {
    const filterAction: ResetComputeByFilter = {
        type: RESET_COMPUTE_BY_FILTER,
        payload: {}
    };
    yield resetClientFill(filterAction);
}
export function* watchFilterChange() {
    yield takeLatest(SET_ANOMALY_FILTER, activateFilterAciton);
    yield takeLatest(SET_CONTRIBUTION_FILTER, activateFilterAciton)
}
