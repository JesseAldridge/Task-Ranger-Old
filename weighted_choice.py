import random

def weighted_choice(choices):

    # Return weighted random selection; format: {'choice1':.7, 'choice2':.5}

    if not choices:
        raise IndexError  # raise IndexError on empty dict

    def choice_value(choice_key):
      choice_val = choices[choice_key]
      if isinstance(choice_val, dict):
        return choice_val['value']
      return choice_val

    def select_choice(choice_key):
      choice_val = choices[choice_key]
      if isinstance(choice_val, dict):
        node_sequence = [choice_val]
        while isinstance(choice_val, dict):
          choice_val = weighted_choice(choice_val['children'])
          node_sequence.append(choice_val)
        return node_sequence
      return choice_key

    total = sum(choice_value(choice_key) for choice_key in choices)
    rand = random.uniform(0, total)
    upto = 0
    for choice_key in choices:
        weight = choice_value(choice_key)
        if upto + weight > rand:
            return select_choice(choice_key)
        upto += weight

if __name__ == '__main__':
  print weighted_choice({
    'study': {
      'value': 2400,
      'children': {
        'categories': 1,
        'cleanup': 1,
      }
    },
    'debug': 1500,
    'meeting': 1200,
    'plan': 1100,
    'errands': 900,
    'setup':  {
      'value': 800,
      'children': {
        'categories': 1,
        'cleanup': 1,
      }
    },
    'coding': 800,
    'talk': 500,
    'exercise': 400,
    'writing': 300,
    'break': 200,
    'thinking': 200,
    'daydream': 100,
  })
