import numpy as np

class DAGMM:

    def __init__(self, grad):
        self.p = 0.9
        self.grad = grad

    def score(self):
        sorted_index = sorted(self.grad)
        grad = []
        for item in sorted_index:
            grad.append(self.grad[item])
        print(type(np.asarray(grad)))
        # np.savez_compressed("./anomaly/metrics/dagmm/data/grad", x=np.asarray(grad))
        return