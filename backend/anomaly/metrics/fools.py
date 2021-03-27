import numpy as np


class Fools:

    def __init__(self, k):
        self.k = k

    def score(self, grad):

        length = len(grad)

        # Use cosine similarity
        score = {}
        similarity_matrix = np.zeros([length, length])
        for i in range(length):
            for j in range(i + 1, length):
                array_i = np.asarray(grad[str(i)])
                array_j = np.asarray(grad[str(j)])
                similarity_matrix[i][j] = np.sum(array_i * array_j) / \
                                          (np.sqrt(np.sum(np.square(array_i))) * np.sqrt(np.sum(np.square(array_j))))
            all = []
            for j in range(0, length):
                if i != j:
                    all.append(similarity_matrix[i][j]) if i < j else all.append(similarity_matrix[j][i])
            all.sort()
            pruned = np.asarray(all[0: self.k])
            score[str(i)] = np.sum(pruned) / self.k

        max_val = max(score.values())
        min_val = min(score.values())
        for key in score:
            if max_val - min_val == 0:
                score[key] = 0
            else:
                score[key] = 1 - (score[key] - min_val) / (max_val - min_val)
        return score