from flask import Flask, jsonify
from flask_cors import CORS
from flask_apscheduler import APScheduler

from services import database as db
from services.scheduler import cache_lots_and_update_db
from services.scheduler import ping
# db.main()

from routes.bookmarksController import bookmarks_bp
from routes.searchcarparkController import searchcarpark_bp
from routes.settingsController import sort_option_bp

import requests
import os
from dotenv import load_dotenv

app = Flask(__name__)
CORS(app)

app.register_blueprint(bookmarks_bp)
app.register_blueprint(searchcarpark_bp)
app.register_blueprint(sort_option_bp)

scheduler = APScheduler()
@scheduler.task("interval", id = "my_job", seconds=60)
def cache_job():
    cache_lots_and_update_db()

scheduler.init_app(app)
scheduler.start()

if __name__ == '__main__':
    app.run()
