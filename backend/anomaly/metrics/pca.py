import numpy as np
from sklearn.decomposition import PCA

class Pca:

    def __init__(self, k):
        self.k = k

    def score(self, grad):

        index = list(map(int, grad.keys()))
        index.sort()
        index = list(map(str, index))
        sorted_grad = []
        for i in range(len(index)):
            sorted_grad.append(grad[index[i]])
        sorted_grad = np.asarray(sorted_grad)

        pca = PCA(n_components=self.k)
        pca.fit(sorted_grad)
        # eigen_values = pca.explained_variance_
        eigen_vectors = pca.components_
        trans_grad = pca.fit_transform(sorted_grad)


        reconstruct_grad = []
        for i in range(len(trans_grad)):
            res = np.zeros(len(eigen_vectors[0]))
            for j in range(len(eigen_vectors)):
                res += trans_grad[i][j] * eigen_vectors[j]
            reconstruct_grad.append(list(res))

        reconstruct_grad = np.asarray(reconstruct_grad)

        score = {}
        for i in range(len(sorted_grad)):
            score[str(i)] = np.sqrt(np.sum(np.square(sorted_grad[i] - reconstruct_grad[i])))

        max_val = max(score.values())
        min_val = min(score.values())
        if max_val - min_val == 0 or max_val is 'nan' or min_val is 'nan':
            for key in score:
                score[key] = 0
        else:
            for key in score:
                score[key] = (score[key] - min_val) / (max_val - min_val)

        return score

