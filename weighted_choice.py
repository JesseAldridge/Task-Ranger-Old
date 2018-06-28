#!/usr/bin/python
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
    node(.1, 'categorize_tasks'),
    node(.1, 'cleanup_notes'),
    node(.7, 'review_categorized', sub_categories or [])
  ])

def sub_categories(weights):
  return [node(weight, str(weight)) for weight in weights]

if __name__ == '__main__':
  categories = [ # 1 year
    node(.3, 'startup', [  # 15 weeks
      node(.8, 'work on existing ideas', [ # 12 weeks
        node(157, 'coding ai', [
          node(.4, 'learn'),
          node(.3, 'random notes'),
          node(.1, 'build stuff'),
          node(.1, 'plan'),
          node(.1, 'use cases'),
        ]),
        node(50, 'better linkedin'),
        node(12, 'adult education'),
        node(10, 'reputation system'),
        node(9, 'better notes'),
        node(8, 'better web browser'),
        node(8, '10x vote'),
        node(7, 'cardbrew.com'),
        node(7, "better dr's appointments"),
        node(7, "better meetup.com"),
        node(7, "pay pass"),
      ]),
      node(.2, 'generate new ideas and rank existing')
    ]),
    node(.2, 'improvement', [
      node(.8, 'categorized_topics', [
        category(2500, 'study', sub_categories([69.5, 57, 50.5, 48, 6, 1])),
        category(1500, 'debug'),
        category(1300, 'meeting'),
        category(1200, 'plan'),
        category(900, 'errands', sub_categories([107, 15, 11.5, 4.5, 3.5])),
        category(900, 'setup'),
        category(800, 'coding'),
        category(500, 'talk'),
        category(400, 'exercise'),
        category(300, 'writing'),
        category(200, 'break'),
        category(200, 'thinking'),
        category(100, 'daydream'),
      ]),
      node(.1, 'establish metrics'),
      node(.1, 'review previous work'),
    ]),
    node(.2, 'learning', [
      node(.3, 'read list of books and articles', [
        node(.9, 'read'),
        node(.1, 'triage'),
      ]),
      node(.5, 'computers', [
        node(.3, 'machine learning'),
        node(.3, 'natural language processing'),
        node(.2, 'compilers'),
        node(.2, 'operating systems'),
      ]),
      node(.5, 'fundamentals', [
        node(.4, 'math'),
        node(.3, 'cognition'),
        node(.1, 'biology'),
        node(.1, 'chemistry'),
        node(.1, 'physics'),
      ]),
      node(.1, 'read to-read articles'),
    ]),
    node(.2, 'networking'),
    node(.033, 'errands'),
    node(.033, 'finances'),
    node(.033, 'wildcard'),
  ]

  print [node['name'] for node in weighted_choice(categories)]
