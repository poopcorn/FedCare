import numpy as np
import math

class Atten:

    def __init__(self, metric):
        self.dis_metric = metric

    def score(self, grad, avg_grad):
        score = {}
        if self.dis_metric == 'eu':
            for key in grad:
                score[key] = self.euclidean(grad[key], avg_grad)
            score = self.normalize(score, 1)

        elif self.dis_metric == 'cos':
            for key in grad:
                score[key] = self.cos(grad[key], avg_grad)
            score = self.normalize(score, 0)

        # apply softmax function
        # sum = 0
        # for key in score:
        #     sum += math.exp(score[key])
        # for key in score:
        #     score[key] = math.exp(score[key]) / sum
        #
        # score = self.normalize(score, 1)

        return score

    def euclidean(self, v1, v2):
        distance = np.sqrt(np.sum(np.square(np.asarray(v1) - np.asarray(v2))))
        return distance

    def cos(self, v1, v2):
        v1 = np.asarray(v1)
        v2 = np.asarray(v2)
        distance = np.sum(v1 * v2) / (np.sqrt(np.sum(np.square(v1))) * np.sqrt(np.sum(np.square(v2))))
        return distance

    def normalize(self, v, flag):
        max_val = max(v.values())
        min_val = min(v.values())
        if flag:
            for key in v:
                v[key] = (v[key] - min_val) / (max_val - min_val)
        else:
            for key in v:
                v[key] = 1 - (v[key] - min_val) / (max_val - min_val)
        return v
