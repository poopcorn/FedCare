import pickle as pkl
from heatmap import get_all_round

get_all_round()
with open('data/dense_metrics.pkl', 'rb') as fp:
    Dense_Metric = pkl.load(fp)
print('!!!!!!')