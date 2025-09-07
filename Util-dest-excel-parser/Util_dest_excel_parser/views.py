"""
Routes and views for the flask application.
"""

from datetime import datetime
from flask import render_template, request, jsonify, send_file
from Util_dest_excel_parser import app
from Util_dest_excel_parser import service
from Util_dest_excel_parser.dto.modifyRequestDto import *
import json
import io

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

def getFile(req) :
    """
    요청의 파일을 반환합니다.
    (file, errorMsg)
    """
    # 요청에 파일이 포함되어 있는지 확인합니다.
    if 'file' not in req.files:
        return (None, 'fail : file not found')
    
    file = req.files['file']

    # 파일 이름이 비어 있는지 확인합니다.
    if file.filename == '':
        return (None, 'fail : invalid name')
    
    # 파일을 처리합니다.
    if not file:
        return (None, 'fail : can not read')
    
    return (file, '')


@app.route('/parse', methods=['POST'])
def parse_file():
    file, errorMsg = getFile(request)
    if file :
        return jsonify(service.readFile(file)), 200
    return jsonify({'message' : errorMsg}), 500

@app.route('/modify', methods=['POST'])
def modify_file():
    file, errorMsg = getFile(request)
    jsonData = json.loads(request.form.get('data'))
    if file :
        requestArr = [ModifyRequestDto.model_validate(req) for req in jsonData]
        updatedFile = service.modifyFile(file, requestArr)

        if updatedFile :
            excel_stream = io.BytesIO()
            updatedFile.save(excel_stream)
            excel_stream.seek(0)
    
            return send_file(
                excel_stream,
                as_attachment=True,
                download_name=file.filename,
                mimetype=file.mimetype
            )
        else :
            return jsonify({'message' : '파일 수정 실패'}), 500
    return jsonify({'message' : errorMsg}), 500