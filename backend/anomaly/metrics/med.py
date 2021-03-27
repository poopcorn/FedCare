import numpy as np
from scipy.optimize import minimize

class Med:

    def __init__(self, gradients):
        self.gradients = gradients

    def optimizer(self, x):
        sum = 0
        for i in range(len(self.gradients)):
            sum += np.sum(abs(x - np.asarray(self.gradients[str(i)])))
        return sum

    def geo_med(self, x):
        x0 = np.asarray(x)
        res = minimize(self.optimizer, x0, method='BFGS')
        return res.x