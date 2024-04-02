from flask import Flask
from flask_cors import CORS
app = Flask(__name__)
cors = CORS(app)
from . import routes

app.json.sort_keys = False

if __name__ == "main":
    app.run(host="0.0.0.0", port=8001)