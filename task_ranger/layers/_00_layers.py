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
  for old_path in layer_paths:
    old_num, rem_name = split_layer_num(old_path)
    if((from_num and old_num < from_num) or
       (to_num and old_num > to_num)):
       continue
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
  increment_layers(from_num=2, amount=-1)
  # increment_layers(-1)
  print 'done'


