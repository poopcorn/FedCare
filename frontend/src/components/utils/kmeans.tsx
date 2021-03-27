const nearestCenter = (u: number[], centers: number[][], distance: Function): {label: number, d: number} => {
  let d = distance(u, centers[0])
  let label = 0;
  for (let i = 1; i < centers.length; i++) {
    const tmp = distance(u, centers[i]);
    if (tmp < d) {
      d = tmp;
      label = i;
    }
  }
  return {label, d};
};


interface INIT_K {
  cluster: number[][],
  centroids: number[][],
  samples: number[]
}
/**
 * Using k-means++ to initialize the cluster center
 * @param data 
 * @param K 
 * @param distance 
 */
const initK = (data: number[][], K: number, distance: Function): INIT_K => {
  const N = data.length;
  const vectorLength = data[0].length;
  const samples = new Array(N).fill(-1);
  const centroids: number[][] = new Array(K).fill({}).map(v => new Array(vectorLength).fill(0));
  const randCenter = Math.floor(Math.random() * N); 
  const cluster = [[randCenter]]
  samples[randCenter] = 0
  centroids[0] = data[randCenter].concat();
  const dis = new Array(N).fill(0);
  while (cluster.length < K) {
    let sumAll = 0;
    for (let i = 0; i < N; i++) {
      dis[i] = nearestCenter(data[i], centroids, distance).d;
      sumAll += dis[i];
    }
    sumAll *= Math.random();
    for (let i = 0; i < dis.length; i++) {
      sumAll -= dis[i];
      if (sumAll <= 0) {
        centroids[cluster.length] = data[i].concat();
        samples[i] = cluster.length;
        cluster.push([i]);
        break;
      }
    }
  }
  return {
    cluster, centroids, samples
  }
}

export interface KMEANS_RES {
  samples: number[],
  cluster: number[][]
}
/**
 * K-means algorithm
 * @param data 
 * @param distance 
 * @param K 
 * @param maxIter 
 */
export const kmeans = (data: number[][], distance: Function, K: number, maxIter: number = 200): KMEANS_RES => {
  const N = data.length;
  const { cluster, centroids, samples } = initK(data, K, distance);
  const initCluster = cluster.map(v => v[0]);
  for (let times = 0; times < maxIter; times++) {
    let changeCluster = false;
    for (let i = 0; i < N; i++) {
      if (initCluster.includes(i)) {
        continue;
      }

      const updateLabel = nearestCenter(data[i], centroids, distance).label;
      // translate sample from old cluster to new cluster
      if (updateLabel != samples[i]) {
        cluster[updateLabel].push(i);
        if (samples[i] != -1) {
          const index = cluster[samples[i]].indexOf(i);
          cluster[samples[i]].splice(index, 1);
        }
        samples[i] = updateLabel
        changeCluster = true
      }
    }
    if (!changeCluster) {
      break
    }
    
    // update centroids and clusters
    for (let i = 0; i < K; i++) {
      for (let j = 0; j < centroids[i].length; j++) {
        centroids[i][j] = 0;
      }
      cluster[i].forEach(v => {
        for (let j = 0; j < centroids[i].length; j++) {
          centroids[i][j] += data[v][j];
        } 
      });
      for (let j = 0; j < centroids[i].length; j++) {
        centroids[i][j] /= cluster[i].length;
      }
    }
  }

  return {
    samples, cluster
  };
}