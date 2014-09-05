import json
from pprint import pprint
import collections
import re
from itertools import chain
from datetime import datetime

from stemming import porter2
import pylab

from jca.qter.qter_test import *


match_tag = porter2.stem('study')
SORT = True

'''
parse_nodes:
    Read dumped json.  Build node tree.

check_tag_times:
    Walk tree to determine total tag times; eg. (40 min) foo -> bar -> baz

walk_tree:
    Walk through node tree, printing times for nodes with match tag time.

qt_tree:
    MyTree:
        A tree with a method hook for when you click on something.
    parse_nodes
    qt_item_from_node:
        Turn a node into QtItem.  Sort by time spent on match tag.
        QTreeWidgetItem:
            Wrap QTreeWidgetItem.
    Create the test tree.  Launch. 
'''

class Node:
    ' A node has text with tags in it. '

    def __init__(self, node_json):
        for key, val in node_json['attrs'].items():
            setattr(self, key, val)
        self.tags = [porter2.stem(tag)
                     for tag in re.findall('#([a-zA-Z_]+)', self.text)]
        self.original_text = self.text
        self.text = re.sub('#([a-zA-Z_]+)', '', self.text)
        self.children = []

def check_tag_times(root, current_tag=None):
    ' Walk tree to determine total tag times; eg. (40 min) foo -> bar -> baz '

    tag_to_secs = collections.defaultdict(int)
    local_secs = sum(root.daily_times.values())
    sections = root.original_text.split('...')

    date_secs = sorted([(
        datetime.strptime(date_str.split('GMT')[0].strip(), '%b %d %Y'), secs)
        for date_str, secs in root.daily_times.items()])
    keys = [t[0] for t in sorted(date_secs, key=lambda x: x[0])]
    for section in sections:
        match = re.search('#([a-zA-Z_]+)', section)
        if match:
            stem_tag = porter2.stem(match.group(1))
            if stem_tag:
                current_tag = stem_tag
        tag_to_secs[current_tag] += local_secs / float(len(sections))
    for child in root.children:
        check_tag_times(child, current_tag)
        for k, v in child.tag_to_secs.iteritems():
            tag_to_secs[k] += v
    root.tag_to_secs = tag_to_secs

def parse_nodes(json_str):
    ' Read dumped json.  Build node tree. '

    nodes = {}
    top_level = []
    for node_json in json.loads(json_str):
        node_json = node_json['attrs']
        node_json['node_id'] = node_json['id']
        del node_json['id']
        nodes[node_json['node_id']] = node_json
        if not node_json['parent_id']:
            top_level.append(node_json['node_id'])
    return top_level, nodes


if __name__ == '__main__':
    with open('dump.txt') as f:
        json_str = f.read().split(' = ', 1)[-1]
    json_str = json_str.rsplit('var top_level_ids = [', 1)[0]
    json_str = re.sub('2_tree.js:[0-9]+', '', json_str)

    top_level, nodes = parse_nodes(json_str)
    new_json = {'nodes':nodes, 'top_level_ids':top_level}
    with open('new.json', 'w') as f:
        f.write(json.dumps(new_json, indent=2))