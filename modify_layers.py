import os, re

layer_format = '[0-9]{2}_.+'
for old_filename in os.listdir('.'):
  if re.match(layer_format, old_filename):
    old_num = int(filename.split('_', 1)[0])
    new_filename = str(old_num + 1).zfill(2)
    shutil.copyfile(filename

# for each file matching layer format:
  # increment layer number
  # copy file
  # delete original
