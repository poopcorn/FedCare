# from django.shortcuts import render
from django.http import JsonResponse

from anomaly.metrics.krum import Krum
from anomaly.metrics.zeno import Zeno
from anomaly.metrics.fools import Fools
from anomaly.metrics.auror import Auror
from anomaly.metrics.sniper import Sniper
from anomaly.metrics.pca import Pca
from backend.rfile import RFile

# from const import *
import const
import numpy as np



# Create your views here.

# def krum(request):
#
#     rfile = RFile(JSON_PATH)
#
#     k = int(request.GET.get('k', -1))
#     round = int(request.GET.get('round', -1))
#     layers = rfile.get_layer(request.GET.get('layers', -1))
#
#     result = rfile.get_grad(JSON_PATH, layers, round)
#     round = result['round']
#     gradients = result['data']
#     krum_obj = Krum(k)
#     return JsonResponse({'round': round, 'data': krum_obj.get_score(gradients)}, safe=False)

# def geo_med(request):
#
#     layers = get_layer(request.GET.get('layers', -1))
#
#     gradients = get_grad('/Users/zhangtianye/Documents/FD/Femnist/test/', layers)
#     med_obj = Med(gradients)
#     return JsonResponse(med_obj.gradients['0'],safe=False)

def fools(request):

    rfile = RFile(const.JSON_PATH)

    k = int(request.GET.get('k', -1))
    round = int(request.GET.get('round', -1))
    layers = rfile.get_layer(request.GET.get('layers', -1))

    result = rfile.get_grad(const.JSON_PATH, layers, round)
    round = result['round']
    gradients = result['data']
    data = rfile.reshape_grad(gradients)

    fools_obj = Fools(k)

    scores = []
    for i in range(len(data)):
        scores.append(fools_obj.score(data[i]))
    score = rfile.avg_score(scores)

    return JsonResponse({'round': round, 'data': score}, safe=False)

def zeno(request):

    rfile = RFile(const.JSON_PATH)

    # suggest p = 100
    p = float(request.GET.get('p', -1))
    round = int(request.GET.get('round', -1))
    layers = rfile.get_layer(request.GET.get('layers', -1))

    latest_result = rfile.get_perf(const.JSON_PATH, round, 'train')
    latest_round = latest_result['round']
    latest_perf = latest_result['data']
    former_perf = rfile.get_perf(const.JSON_PATH, latest_round - 1, 'train')['data']

    latest_grad = rfile.get_grad(const.JSON_PATH, layers, latest_round)['data']
    reshape_latest_grad = rfile.reshape_grad(latest_grad)
    former_grad = rfile.get_grad(const.JSON_PATH, layers, latest_round - 1)['data']
    reshape_former_grad = rfile.reshape_grad(former_grad)

    zeno_obj = Zeno(p)

    scores = []
    for i in range(len(reshape_latest_grad)):
        scores.append(zeno_obj.score(latest_perf, former_perf, reshape_latest_grad[i], reshape_former_grad[i]))
    score = rfile.avg_score(scores)

    return JsonResponse({'round': latest_round, 'data': score}, safe=False)



def auror(request):

    rfile = RFile(const.JSON_PATH)

    k = int(request.GET.get('k', -1))
    round = int(request.GET.get('round', -1))
    layers = rfile.get_layer(request.GET.get('layers', -1))

    result = rfile.get_grad(const.JSON_PATH, layers, round)
    round = result['round']
    gradients = result['data']
    data = rfile.reshape_grad(gradients)

    auror_obj = Auror(k)

    scores = []
    for i in range(len(data)):
        scores.append(auror_obj.score(data[i]))
    score = rfile.avg_score(scores)

    return JsonResponse({'round': round, 'data': score}, safe=False)

def sniper(request):

    rfile = RFile(const.JSON_PATH)

    p = float(request.GET.get('p', -1))
    round = int(request.GET.get('round', -1))
    layers = rfile.get_layer(request.GET.get('layers', -1))

    result = rfile.get_grad(const.JSON_PATH, layers, round)
    round = result['round']
    gradients = result['data']
    data = rfile.reshape_grad(gradients)

    sniper_obj = Sniper(p)

    scores = []
    for i in range(len(data)):
        scores.append(sniper_obj.score(data[i]))
    score = rfile.avg_score(scores)

    return JsonResponse({'round': round, 'data': score}, safe=False)

# def dagmm(request):
#
#     layers = get_layer(request.GET.get('layers', -1))
#     gradients = get_grad(JSON_PATH, layers, -1)
#
#     dagmm_obj = DAGMM(gradients)
#     dagmm_obj.score()
#     return JsonResponse(['test'], safe=False)

def pca(request):

    rfile = RFile(const.JSON_PATH)

    k = int(request.GET.get('k', -1))
    round = int(request.GET.get('round', -1))
    layers = rfile.get_layer(request.GET.get('layers', -1))

    result = rfile.get_grad(const.JSON_PATH, layers, round)
    round = result['round']
    gradients = result['data']
    data = rfile.reshape_grad(gradients)

    pca_ojb = Pca(k)

    scores = []
    for i in range(len(data)):
        scores.append(pca_ojb.score(data[i]))
    score = rfile.avg_score(scores)

    return JsonResponse({'round': round, 'data': score}, safe=False)
