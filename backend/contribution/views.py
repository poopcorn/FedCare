# from django.shortcuts import render
from django.http import JsonResponse
import json

import const

from contribution.metrics.attention import Atten
from contribution.metrics.perf import Perf
from backend.rfile import RFile

# Create your views here.

def attention(request):

    rfile = RFile(const.JSON_PATH)

    metric = request.GET.get('metric', 'cos')
    round = int(request.GET.get('round', -1))
    layers = rfile.get_layer(request.GET.get('layers', -1))

    result = rfile.get_grad(const.JSON_PATH, layers, round)
    round = result['round']
    gradients = result['data']
    data = rfile.reshape_grad(gradients)


    avg_grad = rfile.get_avg_grad(const.JSON_PATH, layers, round - 1)['data']
    avg_data = rfile.reshape_avg_grad(avg_grad)

    atten_obj = Atten(metric)

    scores = []
    for i in range(len(data)):
        scores.append(atten_obj.score(data[i], avg_data[i]))
    score = rfile.avg_score(scores)

    return JsonResponse({'round': round, 'data': score}, safe=False)

def perf_diff(request):

    rfile = RFile(const.JSON_PATH)

    metric = request.GET.get('metric', 'accuracy')
    round = int(request.GET.get('round', -1))

    result = rfile.get_con(const.JSON_PATH, round)
    round = result['round']
    contribution = result['data']

    perf_obj = Perf(metric)

    # return JsonResponse({'round': contribution}, safe=False)
    return JsonResponse({'round': round, 'data': perf_obj.score(contribution)}, safe=False)