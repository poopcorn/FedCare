import numpy as np
import math
from sklearn.manifold import TSNE
from heatmap import getOneRoundFromFile
from feature import getRoundGrad
# from const import DEFAULT_CLIENT_NUM
import const

def get_multipleInfo(x, y, interval=0.2, scale=[-1, 1]):
    domin = scale[1] - scale[0]
    num = math.ceil(domin / interval)
    matrix = np.zeros((num, num))
    length = x.shape[0]
    # set p(x,y) in matrix
    for i in range(length):
        mx = min(num - 1, int((x[i] - scale[0]) / interval))
        my = min(num - 1, int((y[i] - scale[0]) / interval))
        matrix[mx][my] += 1 / length
    # set p(x) and p(y)
    px = np.zeros(num)
    py = np.zeros(num)
    for i in range(num):
        px[i] = np.sum(matrix[i])
        py[i] = np.sum(matrix[:, i])
    
    res = 0
    for i in range(num):
        for j in range(num):
            if matrix[i][j] == 0:
                continue
            res += matrix[i][j] * math.log(matrix[i][j] / px[i] / py[j] , num)
    return res

tsne = TSNE(n_components=2)
def multiple_information(start, end ,layer, filter):
    # get all metric data
    allMetrics = [getOneRoundFromFile(round, layer) for round in range(start, end + 1)]
    metricNum = sum(filter)
    roundNum = end - start + 1
    clientMetrics = np.zeros((const.DEFAULT_CLIENT_NUM, metricNum * roundNum))
    # tsne data
    shape = ((const.DEFAULT_CLIENT_NUM + 1) * roundNum, metricNum)
    tsne_X = np.zeros(shape)
    avg_offset = const.DEFAULT_CLIENT_NUM * roundNum
    for clientId in range(const.DEFAULT_CLIENT_NUM):
        for roundIdx in range(roundNum):
            cnt = 0
            idx = clientId * roundNum + roundIdx
            for metircId, f in enumerate(filter):
                if f == 0:
                    continue
                clientMetrics[clientId][roundIdx * metricNum + cnt] = allMetrics[roundIdx][metircId][str(clientId)]
                tsne_X[idx][cnt] = allMetrics[roundIdx][metircId][str(clientId)]
                tsne_X[avg_offset + roundIdx][cnt] += (allMetrics[roundIdx][metircId][str(clientId)] / const.DEFAULT_CLIENT_NUM)
                cnt += 1
    
    # calculate Mutiple Information
    multipleInfo = np.zeros((const.DEFAULT_CLIENT_NUM, const.DEFAULT_CLIENT_NUM), dtype=np.float32)
    for i in range(const.DEFAULT_CLIENT_NUM):
        for j in range(i + 1, const.DEFAULT_CLIENT_NUM):
            multipleInfo[j][i] = multipleInfo[i][j] = get_multipleInfo(clientMetrics[i], clientMetrics[j])
    
    # get metric data of tsne
    tsneRes = tsne.fit_transform(tsne_X)
    position = []
    for i in range(const.DEFAULT_CLIENT_NUM):
        offset = i * roundNum
        position.append(tsneRes[offset: offset + roundNum].tolist())
    return {
        'multipleInfo': multipleInfo.tolist(),
        'tsne': {
            'position': position,
            'avgPos': tsneRes[avg_offset: avg_offset + roundNum].tolist()
        }
    }
    # return multipleInfo.tolist()


def get_tsne(start, end, layer):
    # get all gradient data
    allFeatureMap = [getRoundGrad(round) for round in range(start, end + 1)]
    curFeature = [v['cur'] for v in allFeatureMap]
    avgFeature = [v['avg'] for v in allFeatureMap]

    # translate into numpy
    conv_shape = np.array(curFeature[0][0][layer]).flatten().shape[0]
    roundNum = end - start + 1
    # ((clientNum + avg * roundNum), featuremap Flatten shape)
    shape = ((const.DEFAULT_CLIENT_NUM + 1) * roundNum, conv_shape)
    tsne_X = np.zeros(shape)
    for i in range(const.DEFAULT_CLIENT_NUM + 1):
        for roundIdx in range(roundNum):
            idx = i * roundNum + roundIdx
            if i == const.DEFAULT_CLIENT_NUM:
                # avg data
                tsne_X[idx] = np.array(avgFeature[roundIdx][layer]).flatten()
            else:
                # client data
                tsne_X[idx] = np.array(curFeature[roundIdx][i][layer]).flatten()
    tsneRes = tsne.fit_transform(tsne_X)

    # transfer to client postion and avg positon, length = DEFAULT_CLIENT_NUM + 1
    position = []
    diff = []
    avg_offset = const.DEFAULT_CLIENT_NUM  * roundNum
    for i in range(const.DEFAULT_CLIENT_NUM ):
        offset = i * roundNum
        position.append(tsneRes[offset: offset + roundNum].tolist())    # calculate Tsne
        diff.append(
            [np.linalg.norm(tsne_X[offset + roundIdx] - tsne_X[avg_offset + roundIdx]) for roundIdx in range(roundNum)]
        )
    return {
        'position': position,
        'avgPos': tsneRes[avg_offset: avg_offset + roundNum].tolist(),
        'diff': diff
    }
