import json
from pprint import pprint
from collections import defaultdict
import re
from itertools import chain

import pylab
from stemming.porter2 import stem

from jca.pie_chart import slices, pie_chart

class Node:
    def __init__(self, node_json):
        for key, val in node_json['attrs'].items():
            setattr(self, key, val)
        self.tags = re.findall('#([a-zA-Z_]+)', self.text)
        self.text = re.sub('#([a-zA-Z_]+)', '', self.text)
        self.swords = [
            stem(word.lower()) for word in re.findall("([\w']+)", self.text)]
        self.sword_set = set(self.swords)

    def overlap(self, other):
        return 1 - (float(len(self.sword_set() - other.sword_set())) /
                    len(self.sword_set()))

    def count(self, sword):
        return self.swords.count(sword)


class Cluster:
    def __init__(self, tag):
        self.nodes = []
        self.tag = tag

    def sword_set(self):
        return set(chain(*[node.sword_set for node in self.nodes]))


def parse_nodes():
    with open('load_models.js') as f:
        json_str = f.read().split(' = ', 1)[-1]
        json_str = json_str.rsplit('var top_level_ids = [', 1)[0]

    nodes = {}
    for node_json in json.loads(json_str):
        node = Node(node_json)
        nodes[node.id] = node
    return nodes


def cluster_nodes(nodes):
    node_clusters = {}
    untagged = []
    tagged = []
    for node in nodes.values():
        for tag in node.tags:
            if tag not in node_clusters:
                node_clusters[tag] = Cluster(tag)
            node_clusters[tag].nodes.append(node)
        (tagged if node.tags else untagged).append(node)

    to_del = [tag for tag in node_clusters if
              len(node_clusters[tag].nodes) <= 5]
    for tag in to_del:
        del node_clusters[tag]

    return node_clusters, tagged, untagged


def calc_word_freqs(node_clusters):
    for tag, cluster in node_clusters.iteritems():
        cluster.sword_freqs = defaultdict(int)
        cluster.words_per_node = []
        for node in cluster.nodes:
            for sword in node.swords:
                cluster.sword_freqs[sword] += 1
            cluster.words_per_node.append(len(node.swords))
        for sword in cluster.sword_freqs:
            cluster.sword_freqs[sword] /= float(len(cluster.nodes))

        cluster.freq_swords = [word for word, val in
                               sorted(cluster.sword_freqs.iteritems(),
                                      key=lambda x: -x[1])]


def avg_freq(node, cluster):
    word_freqs = [cluster.sword_freqs[word] for word in node.sword_set]
    return sum(word_freqs) / float(len(word_freqs))


def q4_avg_freq(node, cluster):
    word_freqs = sorted([cluster.sword_freqs[word] for word in node.sword_set])
    word_freqs = word_freqs[int(len(word_freqs) * .75):]
    return sum(word_freqs) / float(len(word_freqs))


def classify(node_clusters, tagged, untagged):

    def sword_set(node, tag):
        return len(node.sword_set - node_clusters[tag].sword_set()) == 0

    def min_set(node, tag):
        return (len(node.sword_set) >= min(node_clusters[tag].words_per_node) and
                sword_set(node, tag))

    def min_set_catch(node, tag):
        if not min_set(node, tag):
            return False
        return True


    total_error = 0
    for tag in node_clusters.keys():
        print 'tag:', tag
        cluster = node_clusters[tag]
        results = {}
        classifiers = [min_set_catch]
        for classifier in classifiers:
            classifier.wrongs = [
                node for node in tagged
                if (tag in node.tags) != classifier(node, tag)]
            classifier.error = len(classifier.wrongs) / float(len(tagged))
        best = sorted(classifiers, key=lambda x: x.error)[0]
        if best.error > 0:
            print '  best:', best.__name__, '%i%%' % round(best.error * 100)
            print '  wrong:'
            for node in classifier.wrongs:
                print '   ', node.text, node.tags
                print '      q4 avg freq:', q4_avg_freq(node, cluster)
                print '      avg freq:', avg_freq(node, cluster)
            print '  min:', min(node_clusters[tag].words_per_node)
            print '  words per node: %i %i %i' % (
                min(cluster.words_per_node),
                sum(cluster.words_per_node) / len(cluster.words_per_node),
                max(cluster.words_per_node))
            print '  num nodes:', len(cluster.words_per_node)
            print '  num unique words:', len(cluster.sword_set())
            print '  nodes:'
            for node in node_clusters[tag].nodes:
                print '   ', node.text
        total_error += best.error

    print 'total_error:', '%.1f%%' % (
        total_error / float(len(node_clusters)) * 100)


def main():
    nodes = parse_nodes()
    node_clusters, tagged, untagged = cluster_nodes(nodes)
    calc_word_freqs(node_clusters)
    classify(node_clusters, tagged, untagged)

main()