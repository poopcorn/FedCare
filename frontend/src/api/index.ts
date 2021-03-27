import axios from 'axios';
import qs from 'qs';
import { LayerType, DatasetType } from '../types';

export const getKrum = ({k=5, round=-1, layers=['dense']}) => {
    return axios.get('anomaly/krum/', {
        params: {
            k: k,
            round: round,
            layers: layers
        },
        paramsSerializer: params => {
            return qs.stringify(params)
          }
    })
};

export const getFoolsGold = ({k=5, round=-1, layers=['dense']}) => {
    return axios.get('anomaly/foolsgold/', {
        params: {
            k: k,
            round: round,
            layers: layers
        },
        paramsSerializer: params => {
            return qs.stringify(params)
          }
    })
};

export const getZeno = ({p=100, round=-1}) => {
    return axios.get('anomaly/zeno/', {
        params: {
            p: p,
            round: round,
        }
    })
};

export const getAuror = ({k=5, round=-1, layers=['dense']}) => {
    return axios.get('anomaly/auror/', {
        params: {
            k: k,
            round: round,
            layers: layers
        },
        paramsSerializer: params => {
            return qs.stringify(params)
          }
    })
};

export const getSniper = ({p=0.8, round=-1, layers=['dense']}) => {
    return axios.get('anomaly/sniper/', {
        params: {
            p: p,
            round: round,
            layers: layers
        },
        paramsSerializer: params => {
            return qs.stringify(params)
          }
    })
};

export const getPca = ({k=5, round=-1, layers=['dense']}) => {
    return axios.get('anomaly/pca/', {
        params: {
            k: k,
            round: round,
            layers: layers
        },
        paramsSerializer: params => {
            return qs.stringify(params)
          }
    })
};

export const getContributionGrad = ({round=-1, metric='eu', layers=['dense']}) => {
    return axios.get('contribution/grad_diff/', {
        params: {
            round: round,
            metric: metric,
            layers: layers
        },
        paramsSerializer: params => {
            return qs.stringify(params)
          }
    })
};

export const getContributionPerformance = ({round=-1, metric='accuracy', layers=['dense']}) => {
    return axios.get('contribution/perf_diff/', {
        params: {
            round: round,
            metric: metric,
            layers: layers
        },
        paramsSerializer: params => {
            return qs.stringify(params)
          }
    })
};

export const getWeight = () => {
    return axios.get('weight');
}

export const getGradient = ({round=-1, avg=false}) => {
    return axios.get(avg ? 'avg_grad' : 'client_grad/', {
        params: {
            round: round
        }
    });
}

export const getGradientByRound = (round: number) => {
    return axios.get('get_grad_by_round/', {
        params: {
            round
        }
    });
};

export const get_metrics_by_rounds = ({round=-1, roundNum=0, layers='conv1'}) => {
    return axios.get('get_metrics_by_rounds/', {
        params: {
            round: round,
            roundNum: roundNum,
            layers: layers
        },
    });
};

export const getAllRoundMetrics = ({layers='conv1'}) => {
    return axios.get('all_round_metrics/', {
        params: {
            layers: layers
        },
    });
};

export interface MultipleApi {
    start: number,
    end: number,
    layer: LayerType,
    filter: number[]
};
export const getMultipleInfo = (data: MultipleApi) => {
    return axios.get('get_multiple_information/', {
        params: {
            ...data
        }
    });
};

export const getGraidentTsne = ({start=-1, end=-1, clientId=0, layer='conv1'}) => {
    return axios.get('get_gradient_tsne/', {
        params: {
            start,
            end,
            clientId,
            layer,
        }
    });
};

export const SwitchDataset = ({dataset='FEMNIST'}) => {
  return axios.get('define_path/', {
      params: {
        dataset
      }
  });
};
