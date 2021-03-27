from sklearn.cluster import KMeans
import numpy as np

class Auror:

    def __init__(self, k):
        self.k = k

    def score(self, grad):

        keys = list(grad.keys())
        keys.sort()
        input = []
        for key in keys:
            input.append(grad[key])
        input = np.asarray(input)

        kmeans = KMeans(n_clusters=self.k, random_state=0).fit(input)
        labels = kmeans.labels_
        centers = kmeans.cluster_centers_

        score = {}
        i = 0
        for key in keys:
            cluster = labels[i]
            score[key] = np.sqrt(np.sum(np.square(np.asarray(grad[key]) - centers[cluster])))
            i += 1

        max_val = max(score.values())
        min_val = min(score.values())
        if max_val - min_val == 0:
            for key in score:
                score[key] = 0
        else:
            for key in score:
                score[key] = (score[key] - min_val) / (max_val - min_val)

        return score

