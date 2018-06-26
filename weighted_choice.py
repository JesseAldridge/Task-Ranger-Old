import random

def weighted_choice(choices):
    if not choices:
        raise IndexError  # raise IndexError on empty list

    def select_choice(choice):
      children = choice.get('children', [])
      if children:
        return [choice] + weighted_choice(children)
      return [choice]

    total = sum(choice['weight'] for choice in choices)
    rand = random.uniform(0, total)
    upto = 0
    for choice in choices:
        weight = choice['weight']
        if upto + weight > rand:
            return select_choice(choice)
        upto += weight

def node(weight, name, children=None):
  return {
    'name': name,
    'weight': weight,
    'children': children or []
  }

def category(weight, name, sub_categories=None):
  return node(weight, name, children=[
    node(.1, 'wildcard'),
    node(.15, 'categorize_tasks'),
    node(.15, 'cleanup_notes'),
    node(.7, 'review_categorized', sub_categories or [])
  ])

def sub_categories(weights):
  return [node(weight, str(weight)) for weight in weights]

if __name__ == '__main__':
  categories = [
    node(.3, 'startup', [
      node(.5, 'market size', [
        node(2300, 'apparel'),
        node(1000, 'coding ai', [
          node(.4, 'learn'),
          node(.3, 'random notes'),
          node(.1, 'build stuff'),
          node(.1, 'plan'),
          node(.1, 'use cases'),
        ]),
        node(1000, 'consumer electronics'),
        node(550, 'better ads'),
        node(260, 'better linkedin'),
        node(30, 'adult education'),
      ]),
    ]),
    node(.1, 'improvement', [
      category(2400, 'study', sub_categories([69.5, 57, 50.5, 48, 6, 1])),
      category(1500, 'debug'),
      category(1200, 'meeting'),
      category(1100, 'plan'),
      category(900, 'errands', sub_categories([107, 15, 11.5, 4.5, 3.5])),
      category(800, 'setup'),
      category(800, 'coding'),
      category(500, 'talk'),
      category(400, 'exercise'),
      category(300, 'writing'),
      category(200, 'break'),
      category(200, 'thinking'),
      category(100, 'daydream'),
    ]),
    node(.3, 'learning', [
      node(.2, 'math'),
      node(.2, 'cognition'),
      node(.2, 'machine learning'),
      node(.2, 'natural language processing'),
      node(.2, 'compilers'),
    ]),
    node(.2, 'networking'),
    node(.1, 'wildcard'),
    node(.1, 'review previous work'),
  ]

  print [node['name'] for node in weighted_choice(categories)]
