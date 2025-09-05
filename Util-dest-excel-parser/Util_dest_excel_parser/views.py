"""
Routes and views for the flask application.
"""

from datetime import datetime
from flask import render_template, request, jsonify
from Util_dest_excel_parser import app
from Util_dest_excel_parser import service

'''
사용하지 않는 요청응답

@app.route('/home')
def home():
    """Renders the home page."""
    return render_template(
        'index.html',
        title='Home Page',
        year=datetime.now().year,
    )

@app.route('/contact')
def contact():
    """Renders the contact page."""
    return render_template(
        'contact.html',
        title='Contact',
        year=datetime.now().year,
        message='Your contact page.'
    )

@app.route('/about')
def about():
    """Renders the about page."""
    return render_template(
        'about.html',
        title='About',
        year=datetime.now().year,
        message='Your application description page.'
    )
'''

# ================ Service Page ================
    
@app.route('/')
def getServicePage():
    """Renders the about page."""
    return render_template(
        'destination-parser.html',
        title='destination',
        year=datetime.now().year,
        message='destination'
    )

# ================ Service API ================

@app.route('/parse', methods=['POST'])
def parse_file():
    # 요청에 파일이 포함되어 있는지 확인합니다.
    if 'file' not in request.files:
        return 'fail : file not found'
    
    file = request.files['file']

    # 파일 이름이 비어 있는지 확인합니다.
    if file.filename == '':
        return 'fail : invalid name'
    
    # 파일을 처리합니다.
    if file:
        return jsonify(service.readFile(file))
    
    return 'fail : can not read'





