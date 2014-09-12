import os, re, shutil

# Yield filename of each layer file in current directoy.

def each_layer():
  layer_format = '[0-9]{2}_.+'
  for filename in os.listdir('..'):
    if re.match(layer_format, filename):
      yield os.path.join('..', filename)

# Increment layer number for each layer file.

def increment_layers():
  for old_path in each_layer():
    old_filename = os.path.basename(old_path)
    split = old_filename.split('_', 1)
    old_num = int(split[0])
    new_filename = str(old_num + 1).zfill(2) + '_' + split[1]
    new_path = os.path.join(os.path.dirname(old_path), new_filename)
    shutil.copyfile(old_filename, new_filename)
    os.remove(old_filename)

if __name__ == '__main__':
  increment_layers()