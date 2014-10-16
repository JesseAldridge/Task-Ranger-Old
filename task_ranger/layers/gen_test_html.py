import re, os, sys

import _00_layers


def gen_test_html(requested_num):

  # Write the test html for the requested layer.  Include previous layers and dependencies.

  layer_paths, required = [], []
  page_title = None
  for path in _00_layers.each_layer():
    layer_num, _ = _00_layers.split_layer_num(path)
    if layer_num > requested_num:
      break
    page_title = os.path.basename(path)
    layer_paths.append(path)
    required += parse_required_scripts(path)
  write_html(required, layer_paths, page_title)

def parse_required_scripts(path):
  required = []
  with open(path) as f:
    lines = f.read().splitlines()
  line_iter = iter(lines)
  for line in line_iter:
    if line.strip() == '// requires':
      break
  for line in line_iter:
    if not re.match('^// .+\.(js|css)', line):
      break
    file_path = line.split('// ', 1)[1]
    if not file_path.startswith('http'):
      file_path = '../' + file_path
    required.append(file_path)
  return required

def write_html(required, layer_paths, page_title):
  script_paths = required + layer_paths
  for i in range(len(script_paths)):
    if script_paths[i].endswith('.js'):
      script_paths[i] = '<script src="{}"></script>'.format(script_paths[i])
    else:
      script_paths[i] = '<link rel="stylesheet" href="{}" type="text/css" />'.format(
        script_paths[i])

  with open('test.html', 'w') as f:
    f.write('\n'.join(script_paths + [
      '<script> $(run_test) </script>', '<title>{}</title>'.format(page_title)]))

  os.system('open test.html')

if __name__ == '__main__':
  gen_test_html(int(sys.argv[1]) if len(sys.argv) == 2 else 2)







