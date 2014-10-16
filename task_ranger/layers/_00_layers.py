import os, re, shutil

# Yield filename of each layer file in current directory.

def each_layer():
  layer_format = '^\-?[0-9]{2}_.+\.js$'
  for filename in os.listdir('..'):
    if re.match(layer_format, filename):
      yield os.path.join('..', filename)

# Increment layer number for each layer file.

def increment_layers(amount=1):
  for old_path in each_layer():
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
  increment_layers()
  increment_layers(-1)
