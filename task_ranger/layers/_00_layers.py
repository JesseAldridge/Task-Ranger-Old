import os, re, shutil

# Yield filename of each layer file in current directory.

root_path = '.'

def each_layer_path():
  layer_format = '^\-?[0-9]{2}_.+\.js$'
  for filename in os.listdir(root_path):
    if re.match(layer_format, filename):
      yield os.path.join(root_path, filename)

# Increment layer number for each layer file.

def increment_layers(from_num=None, to_num=None, amount=1):
  layer_paths = list(each_layer_path())
  from_index = (from_num - 1) if from_num else 0
  to_index = (to_num - 1) if to_num else len(layer_paths)
  for old_path in layer_paths[from_index:to_index]:
    old_num, rem_name = split_layer_num(old_path)
    new_filename = str(old_num + amount).zfill(2) + rem_name
    new_path = os.path.join(os.path.dirname(old_path), new_filename)
    shutil.copyfile(old_path, new_path)
    os.remove(old_path)


# "../00_foo.js" -> [0, "_foo.js"]

def split_layer_num(path):
  filename = os.path.basename(path)
  split = filename.split('_', 1)
  return int(split[0]), '_' + split[1]

if __name__ == '__main__':
  print 'running'
  increment_layers(from_num=10, amount=1)
  # increment_layers(-1)
  print 'done'


