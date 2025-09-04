"""
The flask application package.
"""

from flask import Flask
app = Flask(__name__)

import Util_dest_excel_parser.views
