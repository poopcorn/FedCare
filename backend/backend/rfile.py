import json
import numpy as np


from backend.file import File
from const import ROUND_EVERY_FILE


class RFile:

    def __init__(self, path):
        self.JSON_PATH = path

    # change layers paramaters from str to list
    def get_layer(self, string):
        if string == -1:
            layers = 'layer1'
        else:
            layers = string
        return layers
        # if isinstance(string, str):
        #     layers = str[1: len(string) - 1]
        #     layers = layers.split(',')
        #     for i in range(len(layers)):
        #         layers[i] = layers[i][1: len(layers[i]) - 1]
        # elif isinstance(str, list):
        #     layers = string
        # else:
        #     layers = ['dense']
        # return layers

    # determine gradients from which layers should be used
    def get_grad(self, path, layer, round):

        filename = self.get_filename(round, 'client_grad', 'gradients_')

        file = open(path + 'client_grad/' + filename, 'r', encoding='utf-8')
        data = json.load(file)
        file.close()

        if round == -1:
            round = list(data.keys())[-1]
        data = data[str(round)]

        # get gradients of all clients
        vec = {}
        for key in data:
            vec[key] = data[key][layer]
        return {'round': int(round), 'data': vec}

    # get the performance of a certain round
    def get_perf(self, path, round, stage):

        file = open(path + 'performance.json', 'r', encoding='utf-8')
        data = json.load(file)
        file.close()

        if round == -1:
            round = list(data.keys())[-1]

        data = data[str(round)][stage]

        return {'round': int(round), 'data': data}

    # get the contribution of a certain round
    def get_con(self, path, round):

        file = open(path + 'contribution.json', 'r', encoding='utf-8')
        data = json.load(file)
        file.close()

        if round == -1:
            round = list(data.keys())[-1]
        data = data[str(round)]

        return {'round': int(round), 'data': data}

    def get_avg_grad(self, path, layers, round):

        filename = self.get_filename(round, 'avg_grad', 'avg_grad_')

        file = open(path + 'avg_grad/' + filename, 'r', encoding='utf-8')
        data = json.load(file)
        file.close()

        if round == -1:
            round = list(data.keys())[-1]
        data = data[str(round)]

        vec = data[layers]
        return {'round': int(round), 'data': vec}

    def get_filename(self, round, dir_name, file_prefix):
        if round == -1:
            file_obj = File(self.JSON_PATH + dir_name, file_prefix)
            filename = file_obj.latest_file(ROUND_EVERY_FILE)
        else:
            filename = file_prefix + \
                       str((round // ROUND_EVERY_FILE) * ROUND_EVERY_FILE) + '_' + \
                       str((round // ROUND_EVERY_FILE) * ROUND_EVERY_FILE + ROUND_EVERY_FILE - 1) + '.json'
        return filename

    def extract_grad(self, gradient):
        data = []

        l1 = len(gradient)
        l2 = len(gradient[0])
        l3 = len(gradient[0][0])
        l4 = len(gradient[0][0][0])
        if max(l1, l2, l3, l4) == l1:
            for i in range(l1):
                vec = np.array(gradient[i][0])
                for j in range(1, l2):
                    vec += np.array(gradient[i][j])
                vec = vec / l2
                data.append(vec.tolist())
            return data, l1
        else:
            for i in range(l1):
                for j in range(l2):
                    vec = np.array(gradient[i][j][0])
                    for k in range(1, l3):
                        vec += np.array(gradient[i][j][k])
                    vec = vec / l3
                    gradient[i][j] = vec.tolist()

            for k in range(l4):
                vec1 = []
                for i in range(l1):
                    vec2 = []
                    for j in range(l2):
                        vec2.append(gradient[i][j][k])
                    vec1.append(vec2)
                data.append(vec1)
            return data, l4

    def reshape_grad(self, gradient):
        data = []
        for key in gradient:
            gradient[key], length = self.extract_grad(gradient[key])
        for i in range(length):
            one_data = {}
            for key in gradient:
                one_data[key] = np.array(gradient[key][i]).flatten().tolist()
            data.append(one_data)
        return data

    def reshape_avg_grad(self, gradient):
        data = []
        gradient, length = self.extract_grad(gradient)
        for i in range(length):
            data.append(np.array(gradient[i]).flatten().tolist())
        return data

    def avg_score(self, scores):
        score = {}
        for key in scores[0]:
            score[key] = 0
            for i in range(len(scores)):
                score[key] += scores[i][key]
            score[key] = score[key] / len(scores)
        return score