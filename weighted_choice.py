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

def add_category(hash, name, hours):
  hash[name] = {
    'name': name,
    'children': {
      'wildcard': .1,
      'categorize_tasks': .15,
      'cleanup_notes': .15,
      'review_tasks': .6,
    },
    'value': hours,
  }

if __name__ == '__main__':
  choice_name_to_choice_dict = {}
  for category_name, hours in [
    ('study', 2400),
    ('debug', 1500),
    ('meeting', 1200),
    ('plan', 1100),
    ('errands', 900),
    ('setup', 800),
    ('coding', 800),
    ('talk', 500),
    ('exercise', 400),
    ('writing', 300),
    ('break', 200),
    ('thinking', 200),
    ('daydream', 100),
  ]:
    add_category(choice_name_to_choice_dict, category_name, hours)
  print weighted_choice(choice_name_to_choice_dict)
