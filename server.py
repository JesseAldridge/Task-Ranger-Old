import sys

import flask


app = flask.Flask(__name__)

app.jinja_env.variable_start_string='((('
app.jinja_env.variable_end_string=')))'
app.comment_start_string='((#'
app.comment_end_string='#))'

port = int(sys.argv[1]) if len(sys.argv) == 2 else 80

app.jinja_env.variable_start_string='{[{'
app.jinja_env.variable_end_string='}]}'

@app.route('/')
def index():
  return flask.render_template('index.html')

@app.route('/main_app.html')
def main_app():
  return flask.render_template('main_app.html')

@app.route('/03_top_div.html')
def top_div():
  return flask.render_template('03_top_div.html')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=port, debug=(port != 80))

