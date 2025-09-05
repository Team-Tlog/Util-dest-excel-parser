
import pandas as pd
import numpy as np
import math
import ast


def readFile(file) :
    return getTagsFromExcel(file)

def getTagsFromExcel(file):
    """
    excel 파일로부터 태그 정보만 추출해 Dictionary로 변환합니다.
    """
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