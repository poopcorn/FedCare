import { KMEANS_RES } from "../components/utils/kmeans";

export type OneLayer = number[][];

export type FeatureType = 'LastRound' | 'Aggregated';

export interface AggregatedFeatureMap {
  layer1: OneLayer[];  // 64 * 5 * 5 (channel, kernel, kernel)
  layer2: OneLayer[];  // 64 * 5 * 5 (channel, kernel, kernel)
}
export interface ClientFeatureMap extends AggregatedFeatureMap {
  clientId: number;
}

export interface LayerCluster {
  layer1: KMEANS_RES,
  layer2: KMEANS_RES,
  scale: {
    layer1: number[],
    layer2: number[],
  }
}

export interface FeatureCluster {
  K: number,
  isFold: boolean[],
  LastRound: LayerCluster,
  Aggregated: LayerCluster,
  Current: LayerCluster
}

export interface FeatureMap {
  heatmap: ClientFeatureMap[],
  clients: ClientFeatureMap[],
  lastRound: ClientFeatureMap[],
  aggregated: AggregatedFeatureMap,
  cluster: FeatureCluster,
  curClientId: number;
  featureType: FeatureType;
};

export const DEFAULT_CLUSTER_CLIENT = 1;

export const DEFAULT_FEATUREMAP: FeatureMap = {
  heatmap: [],
  clients: [],
  lastRound: [],
  aggregated: {
    layer1: [],
    layer2: []
  },
  cluster: {
    K: 2,
    isFold: [true, true, true, true, true],
    LastRound: {
      layer1: {
        cluster: [],
        samples: [],
      },
      layer2: {
        cluster: [],
        samples: []
      },
      scale: {
        layer1: [-0.1, 0.1],
        layer2: [-0.1, 0.1],
      }
    },
    Aggregated: {
      layer1: {
        cluster: [],
        samples: []
      },
      layer2: {
        cluster: [],
        samples: []
      },
      scale: {
        layer1: [-0.1, 0.1],
        layer2: [-0.1, 0.1],
      }
    },
    Current: {
      layer1: {
        cluster: [],
        samples: []
      },
      layer2: {
        cluster: [],
        samples: []
      },
      scale: {
        layer1: [-0.1, 0.1],
        layer2: [-0.1, 0.1],
      }
    }
  },
  curClientId: -1,
  featureType: 'LastRound'
};
