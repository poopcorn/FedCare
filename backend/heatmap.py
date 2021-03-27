import os
import json
import pickle
import math

import const

from backend.file import File

from anomaly.metrics.krum import Krum
from anomaly.metrics.zeno import Zeno
from anomaly.metrics.fools import Fools
from anomaly.metrics.auror import Auror
from anomaly.metrics.sniper import Sniper
from anomaly.metrics.pca import Pca
from backend.rfile import RFile

from contribution.metrics.attention import Atten
from contribution.metrics.perf import Perf


# READ RFILE
sniper_obj = Sniper(0.8)
fools_obj = Fools(15)
auror_obj = Auror(1)
zeno_obj = Zeno(1)
pca_obj = Pca(2)
atten_eu_obj = Atten('eu')
atten_cos_obj = Atten('cos')
perf_a_obj = Perf('accuracy')
perf_l_obj = Perf('loss')

# LOAD CLIENT DATA
conv1AllRoundFile = 'data/{}_{}.pkl'.format(500, 'layer1')
allRoundRes = {}
for layer in const.LAYERS_NANME:
    fileName = '{}/{}_{}.pkl'.format(const.DATA_SAVE_FILE, const.DEFAULT_ROUND_NUM, layer)
    if os.path.exists(fileName):
        with open(fileName, 'rb') as fp:
            allRoundRes[layer] = pickle.load(fp)
            fp.close()

def getOneRoundFromFile(curRound, layer):
    if curRound <= const.DEFAULT_ROUND_NUM and curRound >= 1:
        fileName = '{}/{}_{}.pkl'.format(const.DATA_SAVE_FILE, const.DEFAULT_ROUND_NUM, layer)
        if os.path.exists(fileName):
            return allRoundRes[layer][curRound]
    return getOneRound(curRound, layer)

'''
    获取模型某一轮，某个layer层的metric数据
    @params：
        round: 具体哪一轮
        layer: 具体哪一层
    @returns:
        res: list[][], shape = (9, clientNum),代表了每个指标，所有client的具体数值
'''
def getOneRound(round, layer):
    rfile = RFile(const.JSON_PATH)

    # Anomaly Metrics
    result = rfile.get_grad(const.JSON_PATH, layer, round)
    after_round = result['round']
    gradients = result['data']
    data = rfile.reshape_grad(gradients)

    # krum --> fools
    krum_scores = []
    for i in range(len(data)):
        krum_scores.append(fools_obj.score(data[i]))
    krum_res = rfile.avg_score(krum_scores)
 
    # auror
    auror_scores = []
    for i in range(len(data)):
        auror_scores.append(auror_obj.score(data[i]))
    auror_res = rfile.avg_score(auror_scores)

    # sniper
    sniper_scores = []
    for i in range(len(data)):
        sniper_scores.append(sniper_obj.score(data[i]))
    sniper_res = rfile.avg_score(sniper_scores)

    # pca
    pca_scores = []
    for i in range(len(data)):
        pca_scores.append(pca_obj.score(data[i]))
    pca_res = rfile.avg_score(pca_scores)

    # zeno
    latest_result = rfile.get_perf(const.JSON_PATH, round, 'train')
    latest_round = latest_result['round']
    latest_perf = latest_result['data']
    former_perf = rfile.get_perf(const.JSON_PATH, latest_round - 1, 'train')['data']

    latest_grad = rfile.get_grad(const.JSON_PATH, layer, latest_round)['data']
    reshape_latest_grad = rfile.reshape_grad(latest_grad)
    former_grad = rfile.get_grad(const.JSON_PATH, layer, latest_round - 1)['data']
    reshape_former_grad = rfile.reshape_grad(former_grad)

    zeno_scores = []
    for i in range(len(reshape_latest_grad)):
        zeno_scores.append(zeno_obj.score(latest_perf, former_perf, reshape_latest_grad[i], reshape_former_grad[i]))
    zeno_res = rfile.avg_score(zeno_scores)

    # Contribution Metrics
    avg_grad = rfile.get_avg_grad(const.JSON_PATH, layer, round - 1)['data']
    avg_data = rfile.reshape_avg_grad(avg_grad)

    # attention
    atten_eu_scores = []
    for i in range(len(data)):
        atten_eu_scores.append(atten_eu_obj.score(data[i], avg_data[i]))
    atten_eu_res = rfile.avg_score(atten_eu_scores)

    atten_cos_scores = []
    for i in range(len(data)):
        atten_cos_scores.append(atten_cos_obj.score(data[i], avg_data[i]))
    atten_cos_res = rfile.avg_score(atten_cos_scores)

    # perf diff
    no_layer_result = rfile.get_con(const.JSON_PATH, round)
    contribution = no_layer_result['data']
    perf_a_res = perf_a_obj.score(contribution)
    perf_l_res = perf_l_obj.score(contribution)
    # res = {
    #     'Krum': krum_res,
    #     'Zeno': zeno_res,
    #     'Auror': auror_res,
    #     'Sniper': sniper_res,
    #     'Pca': pca_res,
    #     'eu': atten_eu_res,
    #     'cos': atten_cos_res,
    #     'accuracy': perf_a_res,
    #     'loss': perf_l_res
    # }
    res = [krum_res, zeno_res, auror_res, sniper_res, pca_res, atten_eu_res, atten_cos_res, perf_a_res, perf_l_res]
    return res

def get_all_round():
    res = [{
        'anomaly': [[] for i in range(6)],
        'contribution': [[] for i in range(4)]
    } for client in range(35)]
    layer = ['dense']
    for round in range(1, 500):
        print(round)
        oneRes = getOneRound(round, layer)
        for client in range(35):
            for i in range(6):
                tmp = oneRes[i][str(client)]
                res[client]['anomaly'][i].append(0 if math.isnan(tmp) else tmp)
            for i in range(4):
                tmp = oneRes[i + 6][str(client)]
                res[client]['contribution'][i].append(0 if math.isnan(tmp) else tmp)

    with open('data/dense_metrics.json', 'w') as fp:
        json.dump(res, fp)
    with open('data/dense_metrics.pkl', 'wb') as fp:
        pickle.dump(res, fp)

'''
    保存从第2轮到第roundEnd轮次中对应layer的所有metric值，
    @params
        roundEnd: 具体结尾轮次
        layer: 'conv1' 或者 'conv2'
        name: 保存文件的名字
'''
def saveOneRound(roudEnd, layer, prefix):
    path = '{}/{}_{}.pkl'.format(prefix, roudEnd, layer)
    if os.path.exists(path):
        print('file {} has already saved!'.format(path))
        # with open(path, 'rb') as fp:
        #     res = pickle.load(fp)
        # new_res = [res[i] for i in range(1, roudEnd)]
        # new_res.append(getOneRound(roudEnd, layer))
        # with open(path + '_bak', 'wb') as fp:
        #     pickle.dump(new_res, fp)
        #     fp.close()
        return
    res = [[]]
    for i in range(1, roudEnd):
        res.append(getOneRound(i, layer))
    with open(path, 'wb') as fp:
        pickle.dump(res, fp)
        fp.close()
    print('Finsh Save {}'.format(path))
