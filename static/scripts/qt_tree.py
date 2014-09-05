import json
from pprint import pprint
from collections import defaultdict
import re
from itertools import chain

from stemming import porter2
import pylab

from jca.qter.qter_test import *

#(Need to manually dump to this file once in a while to get latest results.)
dump_file = 'dump.txt'

match_tag = porter2.stem('setup')

class Node:
    ' A node has text with tags in it. '

    def __init__(self, node_json):
        # daily_times, cum_secs, is_expanded, avg_date
        for key, val in node_json['attrs'].items():
            setattr(self, key, val)
        self.tags = [porter2.stem(tag)
                     for tag in re.findall('#([a-zA-Z_]+)', self.text)]
        self.original_text = self.text
        self.text = re.sub('#([a-zA-Z_]+)', '', self.text)


class MyItem(QTreeWidgetItem):
    ' Wrap QTreeWidgetItem. '

    def __init__(self, text):
        # (pass a list cuz QTreeWidgetItem uses columns)
        QTreeWidgetItem.__init__(self, [text])
        self.setFlags(Qt.ItemIsEnabled | Qt.ItemIsEditable |
                      Qt.ItemIsSelectable)

def qt_item_from_node(node, nodes):
    ' Turn a node into QtItem. '

    cum_secs = node.cum_secs
    hms = [cum_secs / 60 / 60, cum_secs / 60 % 60, cum_secs % 60]
    h, m, s = ['0' + str(x) if len(str(x)) == 1 else str(x) for x in hms]
    qt_item = MyItem(node.original_text + '  {0}:{1}:{2}'.format(h, m, s))
    for child_id in node.child_ids:
        sub_qt_item = qt_item_from_node(nodes[child_id], nodes)
        qt_item.addChild(sub_qt_item)
    return qt_item

class MyTree(QTreeWidget):
    ' A tree with a method hook for when you click on something. '

    def __init__(self):
        QTreeWidget.__init__(self)
        self.connect(self, SIGNAL("itemClicked(QTreeWidgetItem*, int)"),
                     self.item_clicked)
    def item_clicked(self, item, column):
        print "item clicked: ", item.text(column)
        if item.text(column) == "foo":
            item.addChild(MyItem("new child"))


def parse_nodes():
    ' Read dumped json.  Build node tree. '

    with open(dump_file) as f:
        json_str = f.read().split(' = ', 1)[-1]
    json_str = json_str.rsplit('var top_level_ids = [', 1)[0]
    json_str = re.sub('2_tree.js:[0-9]+', '', json_str)

    nodes = {}
    top_level = []
    for node_json in json.loads(json_str):
        node = Node(node_json)
        nodes[node.id] = node
        if not node.parent_id:
            top_level.append(node)
    return top_level, nodes

def walk_tree(top_level, nodes, chain=None):
    ' Walk through node tree, looking for any nodes with a matching tag. '

    for node in top_level:
        if chain is None:
            chain = []
        chain.append(node.text[:20])
        walk_tree(
            [nodes[child_id] for child_id in node.child_ids], nodes, chain)
        if 'rpm' in node.text:
            print chain
        # for tag in node.tags:
        #     if tag == match_tag:
        #         print chain
        #         break
        chain.pop()

def qt_tree():
    " Create the test tree.  Launch. "

    start_if_havent()
    tree_ = MyTree()
    tree_.resize(800,400)
    top_level, nodes = parse_nodes()
    for node in top_level:
      item = qt_item_from_node(node, nodes)
      tree_.addTopLevelItem(item)
    tree_.show()
    launch_if_havent()

'''
parse_nodes
    Read dumped json.  Build node tree.

walk_tree
    Walk through node tree, looking for any nodes with a matching tag. 

qt_tree
    MyTree
        A tree with a method hook for when you click on something.
    parse_nodes
    qt_item_from_node
        Turn a node into QtItem.
        MyItem
            Wrap QTreeWidgetItem.
    Create the test tree.  Launch. 
'''

if __name__ == '__main__':
    walk_tree(*parse_nodes())
    qt_tree()