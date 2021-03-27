import json
import os

from const import *

from anomaly.metrics.krum import Krum
from anomaly.metrics.zeno import Zeno
from anomaly.metrics.fools import Fools
from anomaly.metrics.auror import Auror
from anomaly.metrics.sniper import Sniper
from anomaly.metrics.pca import Pca
from contribution.metrics.attention import Atten
from contribution.metrics.perf import Perf
from backend.rfile import RFile

history_anomaly_path = JSON_PATH + 'history_anomaly.json'
history_contribution_path = JSON_PATH + 'history_contribution.json'

def revise_json(filepath, round, grad):
    file = open(filepath, 'r', encoding='utf-8')
    json_data = json.load(file)
    file.close()
    json_data[str(round)] = grad
    return json_data

def rewrite_json(filepath, data):
    file = open(filepath,'w',encoding='utf-8')
    json.dump(data, file, ensure_ascii=False)
    file.close()

file = open(JSON_PATH + 'performance.json', 'r', encoding='utf-8')
data = json.load(file)
file.close()


for key in data:

    anomaly = {}
    contribution = {}

    if int(key) > 1:

        rfile = RFile(JSON_PATH)

        layers = ['layer1']
        round = int(key)
        this_round_gradients = rfile.get_grad(JSON_PATH, layers, round)['data']
        last_round_gradients = rfile.get_grad(JSON_PATH, layers, round - 1)['data']
        this_round_perf = rfile.get_perf(JSON_PATH, round, 'train')['data']
        last_round_perf = rfile.get_perf(JSON_PATH, round - 1, 'train')['data']
        last_round_avg_grad = rfile.get_avg_grad(JSON_PATH, layers, round - 1)['data']
        this_round_contribution = rfile.get_con(JSON_PATH, round)['data']


        # krum
        krum_obj = Krum(5)
        krum_score = krum_obj.get_score(this_round_gradients)

        #foolsgold
        fools_obj = Fools(5)
        fools_score = fools_obj.score(this_round_gradients)

        #zeno
        zeno_obj = Zeno(100)
        zeno_score = zeno_obj.score(this_round_perf, last_round_perf, this_round_gradients, last_round_gradients)

        #auror
        auror_obj = Auror(1)
        auror_score = auror_obj.score(this_round_gradients)

        #sniper
        sniper_obj = Sniper(this_round_gradients, 0.85)
        sniper_score = sniper_obj.score()

        #pca
        pca_ojb = Pca(10)
        pca_score = pca_ojb.score(this_round_gradients)

        for client in krum_score:
            anomaly[client] = {'krum': krum_score[client], 'fools': fools_score[client], 'zeno': zeno_score[client],
                                    'auror': auror_score[client], 'sniper': sniper_score[client], 'pca': pca_score[client]}

        if os.path.exists(history_anomaly_path):
            file = open(history_anomaly_path, 'r', encoding='utf-8')
            file_data = json.load(file)
            file.close()
            file_data[key] = anomaly
            rewrite_json(history_anomaly_path, file_data)
            print('History anomaly data saved.')
        else:
            rewrite_json(history_anomaly_path, {key: anomaly})
            print('History anomaly file created.')

        # attention
        atten_obj1 = Atten('eu')
        atten_obj2 = Atten('cos')
        atten1_score = atten_obj1.score(this_round_gradients, last_round_avg_grad)
        atten2_score = atten_obj2.score(this_round_gradients, last_round_avg_grad)

        # performance based contribution



        perf_obj1 = Perf('accuracy')
        perf_obj2 = Perf('loss')
        perf1_score = perf_obj1.score(this_round_contribution)
        perf2_score = perf_obj2.score(this_round_contribution)

        for client in atten1_score:
            contribution[client] = {'attention_eu': atten1_score[client], 'attention_cos': atten2_score[client],
                                    'auc_based': perf1_score[client], 'loss_based': perf2_score[client]}

        if os.path.exists(history_contribution_path):
            file = open(history_contribution_path, 'r', encoding='utf-8')
            file_data = json.load(file)
            file.close()
            file_data[key] = contribution
            rewrite_json(history_contribution_path, file_data)
            print('History contribution data saved.')
        else:
            rewrite_json(history_contribution_path, {key: contribution})
            print('History contribution file created.')






