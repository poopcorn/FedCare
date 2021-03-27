import networkx as nx
import numpy as np

class Sniper:

    def __init__(self, prop):
        self.y = 0.5
        self.r = 0.05
        self.graph = nx.Graph()
        self.proportion = prop

    def score(self, grad):

        nodes = [int(k) for k in list(grad.keys())]
        self.graph.add_nodes_from(nodes)

        length = len(grad)
        distance_matrix = np.zeros([length, length])
        for i in range(length):
            for j in range(i + 1, length):
                distance_matrix[i][j] = np.sqrt(np.sum(np.square(np.asarray(grad[str(i)]) - np.asarray(grad[str(j)]))))

        max_val = distance_matrix.max()
        min_val = distance_matrix.min()
        for i in range(length):
            for j in range(i + 1, length):
                distance_matrix[i][j] = (distance_matrix[i][j] - min_val) / (max_val - min_val)

        tr = self.y
        max_len = 0
        while tr < 1 and max_len < length * self.proportion:
            self.add_edges(tr, distance_matrix)
            cliques = nx.find_cliques(self.graph)
            max_len = 0
            for item in cliques:
                if len(item) > max_len:
                    max_len = len(item)
                    max_clique = item
            tr += self.r

        score = {}
        for key in grad:
            if int(key) in max_clique:
                score[key] = 0
            else:
                score[key] = 1
        return score



    def add_edges(self, threshold, matrix):

        self.graph.remove_edges_from(self.graph.edges())

        length = len(matrix)
        for i in range(length):
            for j in range(i + 1, length):
                if matrix[i][j] < threshold:
                    self.graph.add_edge(i, j)
        return