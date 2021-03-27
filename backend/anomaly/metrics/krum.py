import numpy as np


class Krum:

    def __init__(self, k):
        self.k = k

    def get_score(self, grad):
        '''
        :param clients: gradients of all clients for one round - {'round': n, 'gradient': {}}
        :param k: k nearest neighbour
        :param layers: gradients in which layers need to be computed
        :return: anomaly score of all clients - {'client_id': score, 'client_id': score}
        '''

        length = len(grad)


        # Use Euclidean Distance
        score = {}
        distance_matrix = np.zeros([length, length])
        for i in range(length):
            for j in range(i + 1, length):
                distance_matrix[i][j] = np.sqrt(np.sum(np.square(np.asarray(grad[str(i)]) - np.asarray(grad[str(j)]))))
            all = []
            for j in range(0, length):
                if i != j:
                    all.append(distance_matrix[i][j]) if i < j else all.append(distance_matrix[j][i])
            all.sort()
            pruned = np.asarray(all[0: self.k])
            score[str(i)] = np.sum(pruned)

        max_val = max(score.values())
        min_val = min(score.values())
        for key in score:
            score[key] = (score[key] - min_val) / (max_val - min_val)

        return score