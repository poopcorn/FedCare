import { State } from '../../types';

export const getLayer = (state: State) => state.Server.layer;
export const getDataset = (state: State) => state.Server.dataset;
export const getModel = (state: State) => state.Server.model;
export const getClientNum = (state: State) => state.Server.clientNum;
export const getClientRound = (state: State) => state.Client.roundShow;
export const getRoundRes = (state: State) => state.Client.roundRes;
export const getImpactRoundRes = (state: State) => state.Impact.roundRes;
export const getManuRound = (state: State) => state.Client.displayRound;
export const getSpaceRound = (state: State) => state.Server.round;
export const getTotalRound = (state: State) => state.Server.totalround;
export const getShowRoundNum = (state: State) => state.Server.showRoundNum;
export const getAnomaly = (state: State) => state.Analysis.anomaly;
export const getContribution = (state: State) => state.Analysis.contribution;
export const getAnomalyFilter = (state: State) => state.Analysis.anomalyFilter;
export const getContributionFilter = (state: State) => state.Analysis.contributionFilter;
export const getFeatureK = (state: State) => state.Feature.cluster.K;
export const getSelectedRound = (state: State) => state.Client.selectedRound;
export const getImpactSetting = (state: State) => ({
  roundRange: state.Impact.fetchDataRange,
  layer: state.Impact.layer,
  filter: state.Impact.filter
});
