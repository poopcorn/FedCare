from django.http import HttpResponse
from django.http import JsonResponse
import json
import os
import pickle


import pickle as pkl

import const
from const import ROUND_EVERY_FILE
from backend.file import File
# from heatmap import getOneRound, getOneRoundFromFile
from impact import multiple_information, get_tsne
from feature import getRoundGrad
from backend.rfile import RFile
import heatmap


def performance(request):
    round = int(request.GET.get('round', -1))
    num = int(request.GET.get('number', 1))

    if const.DEFAULT_DATASET == 'FEMNIST':
        round -= 1

    file = open(const.JSON_PATH + 'performance.json', 'r', encoding='utf-8')
    data = json.load(file)
    file.close()

    if round == -1:
        performance = data
    elif num == 1:
        performance = data[str(round)]
    else:
        performance = {}
        for i in range(round - num + 1, round + 1):
            performance[str(i)] = data[str(i)]

    return JsonResponse(performance, safe=False)

def get_grad_by_round(request):
    round = int(request.GET.get('round', -1))
    return JsonResponse(getRoundGrad(round), safe=False)

def client_grad(request):

    round = int(request.GET.get('round', -1))

    if round == -1:
        file_obj = File(const.JSON_PATH + 'client_grad', 'gradients_')
        filename = file_obj.latest_file(ROUND_EVERY_FILE)
    else:
        filename = 'gradients_' + \
                   str((round // ROUND_EVERY_FILE) * ROUND_EVERY_FILE) + '_' + \
                   str((round // ROUND_EVERY_FILE) * ROUND_EVERY_FILE + ROUND_EVERY_FILE - 1) + '.json'

    file = open(const.JSON_PATH + 'client_grad/' + filename, 'r', encoding='utf-8')
    data = json.load(file)
    file.close()
    
    if round == -1:
        return JsonResponse({'round': int(list(data.keys())[-1]), 'data': data[list(data.keys())[-1]]}, safe=False)
    else:
        return JsonResponse(data[str(round)], safe=False)



def avg_grad(request):

    round = int(request.GET.get('round', -1))

    if round == -1:
        file_obj = File(const.JSON_PATH + 'avg_grad', 'avg_grad_')
        filename = file_obj.latest_file(ROUND_EVERY_FILE)
    else:
        filename = 'avg_grad_' + \
                   str((round // ROUND_EVERY_FILE) * ROUND_EVERY_FILE) + '_' + \
                   str((round // ROUND_EVERY_FILE) * ROUND_EVERY_FILE + ROUND_EVERY_FILE - 1) + '.json'

    file = open(const.JSON_PATH + 'avg_grad/' + filename, 'r', encoding='utf-8')
    data = json.load(file)
    file.close()

    if round == -1:
        return JsonResponse({'round': int(list(data.keys())[-1]), 'data': data[list(data.keys())[-1]]}, safe=False)
    else:
        return JsonResponse(data[str(round)], safe=False)


def trained_clients(request):

    round = int(request.GET.get('round', -1))
    num = int(request.GET.get('number', -1))


    if round == -1 or num == -1:
        return JsonResponse('Wrong Parameters', safe=False)


    files = []
    cur_round = round - num + 1
    while cur_round <= round:
        filename = 'gradients_' + \
               str((cur_round // ROUND_EVERY_FILE) * ROUND_EVERY_FILE) + '_' + \
               str((cur_round // ROUND_EVERY_FILE) * ROUND_EVERY_FILE + ROUND_EVERY_FILE - 1) + '.json'
        files.append(filename)
        cur_round = (cur_round // ROUND_EVERY_FILE) * ROUND_EVERY_FILE + ROUND_EVERY_FILE

    clients = {}
    for filename in files:
        file = open(const.JSON_PATH + 'client_grad/' + filename, 'r', encoding='utf-8')
        data = json.load(file)
        file.close()
        for key in data:
            if round - num + 1 <= int(key) <= round:
                clients[key] = list(map(int, list(data[key].keys())))

    return JsonResponse(clients, safe=False)

def weight(request):

    file = open(const.JSON_PATH + 'weight.json', 'r', encoding='utf-8')
    data = json.load(file)
    file.close()

    return JsonResponse(data, safe=False)


def get_metrics_by_rounds(request):
    curRound = int(request.GET.get('round', -1))
    roundNum = int(request.GET.get('roundNum', -1))
    rfile = RFile(const.JSON_PATH)
    layer = rfile.get_layer(request.GET.get('layers', -1))
    res = []
    for round in range(curRound - roundNum + 1, curRound + 1):
        res.append(heatmap.getOneRoundFromFile(round, layer))
    return JsonResponse(res, safe=False)

def one_round_metric(request):
    round = int(request.GET.get('round', -1))
    rfile = RFile(const.JSON_PATH)
    layer = rfile.get_layer(request.GET.get('layers', -1))
    res = heatmap.getOneRoundFromFile(round, layer)
    return JsonResponse(res, safe=False)


# with open('data/dense_metrics.pkl', 'rb') as fp:
#     Dense_Metric = pkl.load(fp)
#
#
# def get_all_round_metric(request):
#     rfile = RFile(const.JSON_PATH)
#     layers = rfile.get_layer(request.GET.getlist('layers[]', []))
#     return JsonResponse({'res': Dense_Metric}, safe=False)

def get_multiple_information(request):
    start = int(request.GET.get('start', -1))
    end = int(request.GET.get('end', -1))
    rfile = RFile(const.JSON_PATH)
    layer = rfile.get_layer(request.GET.get('layers', -1))
    filterData = request.GET.getlist('filter[]', [])
    filter = [int(v) for v in filterData]
    multipleInfo = multiple_information(start, end, layer, filter)
    return JsonResponse({'res': multipleInfo}, safe=False)

def get_tsne_res(request):
    start = int(request.GET.get('start', -1))
    end = int(request.GET.get('end', -1))
    layer = request.GET.get('layer', 'layer1')
    res = get_tsne(start, end, layer)
    return JsonResponse({'res': res}, safe=False)

def define_path(request):
    path = request.GET.get('dataset', 'DIGIT5')
    const.JSON_PATH = const.JSON_PREFIX + path + '/'
    const.DATA_SAVE_FILE = 'data/{}_{}'.format(const.DEFAULT_MODEL, path)
    if path == 'DIGIT5':
        const.DEFAULT_CLIENT_NUM = 4
        const.DEFAULT_ROUND_NUM = 99
    elif path == 'FEMNIST':
        const.DEFAULT_CLIENT_NUM = 35
        const.DEFAULT_ROUND_NUM = 150

    #re-read pkl file
    for layer in const.LAYERS_NANME:
        fileName = '{}/{}_{}.pkl'.format(const.DATA_SAVE_FILE, const.DEFAULT_ROUND_NUM, layer)
        if os.path.exists(fileName):
            with open(fileName, 'rb') as fp:
                heatmap.allRoundRes[layer] = pickle.load(fp)
                fp.close()
    return JsonResponse({'Define_Path': const.JSON_PATH, 'Define_data_save_file': const.DATA_SAVE_FILE, 'Define_client_number': const.DEFAULT_CLIENT_NUM, 'Define_round_num': const.DEFAULT_ROUND_NUM}, safe=False)

