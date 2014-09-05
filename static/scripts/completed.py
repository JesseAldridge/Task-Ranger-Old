import json
from pprint import pprint
import collections
import re
from itertools import chain
from datetime import datetime

from stemming import porter2

class Node:
    ' A node has text with tags in it. '

    def __init__(self, node_json):
        for key, val in node_json.items():
            setattr(self, key, val)
        self.tags = [porter2.stem(tag)
                     for tag in re.findall('#([a-zA-Z_]+)', self.text)]
        self.original_text = self.text
        self.text = re.sub('#([a-zA-Z_]+)', '', self.text)
        self.children = []

def find_completed(root):
    ' Walk tree to determine total tag times; eg. (40 min) foo -> bar -> baz '

    months = [
        'january', 'february', 'march', 'april', 'may', 'june', 'july', 
        'august', 'september', 'october', 'november', 'december']
    text = root.text.strip().lower()
    if(re.match('^[a-z]+ [0-9]{4}$', text) and 
       text.split(' ', 1)[0] in months):
        initial = root
        depth = 0
        while initial:
            print '  ' * depth + initial.text
            initial = initial.parent
            depth += 1
    for child in root.children:
        find_completed(child)

def parse_nodes(json_str):
    ' Read dumped json.  Build node tree. '

    nodes = {}
    top_level = []
    for node_json in json.loads(json_str):
        node = Node(node_json)
        nodes[node.id] = node
        if not node.parent_id:
            top_level.append(node)
    for node in nodes.values():
        node.parent = None
        if node.parent_id:
            node.parent = nodes[node.parent_id]
    return top_level, nodes

def walk_tree(nodes, prefix=''):
    ' Walk through node tree, printing times for nodes with match tag time. '

    for node in nodes:
        if node.tag_to_secs[match_tag]:
            secs = int(round(node.tag_to_secs[match_tag]))
            mins, secs = secs / 60, secs % 60
            hours, mins = mins / 60, mins % 60
            hms = [str(i).zfill(2) for i in hours, mins]
            time_str = '{0}:{1}'.format(*hms)
            print '{0}({1}) {2}'.format(prefix, time_str, node.text)
        walk_tree(node.children, prefix + '  ')


'''
parse_nodes:  
    Read dumped json.  Build node tree.

check_tag_times:  
    Walk tree to determine total tag times; eg. (40 min) foo -> bar -> baz

walk_tree:
    Walk through node tree, printing times for nodes with match tag time.
'''

if __name__ == '__main__':
    def test_node():
        with open('test_node.txt') as f:
            Node(json.loads(f.read()))
    test_node()

    with open('dump.txt') as f:
        json_str = f.read().split(' = ', 1)[-1]
    json_str = json_str.rsplit('var top_level_ids = [', 1)[0]
    json_str = re.sub('2_tree.js:[0-9]+', '', json_str)

    top_level, nodes = parse_nodes(json_str)
    for node in nodes.values():
        node.children = [nodes[child_id] for child_id in node.child_ids]
    for node in top_level:
        find_completed(node)
