"""
Routes and views for the flask application.
"""

from datetime import datetime
from flask import render_template, request, jsonify
from Util_dest_excel_parser import app
import pandas as pd
import numpy as np
import math
import ast


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







def convertFile(file):
    df = pd.read_excel(file)
    obj = df.to_dict(orient='records')
    for item in obj:
        item['tagNames'] = ast.literal_eval(item['tagNames'])
        item['weight'] = ast.literal_eval(item['weight'])
    return replace_nan_with_none(obj)


def replace_nan_with_none(data):
    """
    재귀적으로 딕셔너리나 리스트 내부의 NaN 값을 None으로 변환하는 함수.
    """
    if isinstance(data, dict):
        return {k: replace_nan_with_none(v) for k, v in data.items()}
    elif isinstance(data, list):
        return [replace_nan_with_none(item) for item in data]
    elif isinstance(data, float) and math.isnan(data):
        return None
    else:
        return data


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
        return jsonify(convertFile(file))
    
    return 'fail : can not read'






@app.route('/')
@app.route('/temp')
def temp():
    """Renders the about page."""
    return render_template(
        'destination-parser.html',
        title='destination',
        year=datetime.now().year,
        message='destination'
    )