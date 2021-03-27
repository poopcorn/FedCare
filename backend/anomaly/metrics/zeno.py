import numpy as np

class Zeno:

    def __init__(self, p):
        self.p = p

    def score(self, perf_this, perf_last, grad_this, grad_last):

        res = {}
        for key in perf_this:
            res[key] = perf_last[key]['loss'] - perf_this[key]['loss'] - \
                       self.p * np.sqrt(np.sum(np.square(np.asarray(grad_this[key]) - np.asarray(grad_last[key]))))
            # print(perf_last[key]['loss'] - perf_this[key]['loss'], self.p * np.sqrt(np.sum(np.square(np.asarray(grad_this[key]) - np.asarray(grad_last[key])))))


        max_val = max(res.values())
        min_val = min(res.values())
        # print(res)
        for key in res:
            res[key] = 1 - (res[key] - min_val) / (max_val - min_val)
            # print(res[key])

        return res