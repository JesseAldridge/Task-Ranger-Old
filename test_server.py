import os, importlib, json
from dateutil import parser
from datetime import datetime

import flask
from flask import Flask, request

app = Flask(__name__)

# Routes to the pages.

@app.route('/')
def index():
  print os.listdir('.')
  return flask.render_template('index.html')


if __name__ == '__main__':
  # Bind to PORT if defined, otherwise default to 5000.
  port = int(os.environ.get('PORT', 5000))
  host = 'localhost' if port == 5000 else '0.0.0.0'
  app.run(host=host, port=port, debug=True)
