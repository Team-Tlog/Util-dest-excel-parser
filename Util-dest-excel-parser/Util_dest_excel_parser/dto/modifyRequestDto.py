from enum import Enum
from pydantic import BaseModel

class TaskType(str, Enum) :
    REMOVE = "REMOVE"

class ModifyRequestDto(BaseModel) :
    row : int
    tag : str
    value : float
    task : TaskType