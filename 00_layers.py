import os, re, shutil


def each_layer():
  layer_format = '[0-9]{2}_.+'
  for filename in os.listdir('.'):
    if re.match(layer_format, old_filename):
      yield filename

# Increment layer number for each layer file.

def increment_layers():
  for old_filename in each_layer():
    split = old_filename.split('_', 1)
    old_num = int(split[0])
    new_filename = str(old_num + 1).zfill(2) + '_' + split[1]
    shutil.copyfile(old_filename, new_filename)
    os.remove(old_filename)
