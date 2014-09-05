import json
from pprint import pprint
from collections import defaultdict
import re

from pylab import *

from jca.pie_chart import slices, pie_chart

new_lines = []
with open('load_models.js') as f:
    for line in f.read().splitlines():
        new_lines.append(re.sub('#([a-zA-Z_]+)', '', line))
with open('load_models.js', 'w') as f:
    f.write('\n'.join(new_lines))
