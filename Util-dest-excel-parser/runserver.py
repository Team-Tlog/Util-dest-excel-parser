"""
This script runs the Util_dest_excel_parser application using a development server.
"""

from os import environ
from Util_dest_excel_parser import app

if __name__ == '__main__':
    HOST = environ.get('SERVER_HOST', '0.0.0.0')
    try:
        PORT = int(environ.get('80', '80'))
    except ValueError:
        PORT = 80
    app.run(HOST, PORT)
