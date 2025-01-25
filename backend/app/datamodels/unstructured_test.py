#example in /datamodels/unstructured_test.py
# THIS IS AN EXAMPLE DO NOT USE
from pydantic import BaseModel, Field
from typing import Optional
from bson import ObjectId

class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v, values, **kwargs):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid objectid")
        return ObjectId(v)

    @classmethod
    def __modify_schema__(cls, field_schema):
        field_schema.update(type="string")

# REPLACE THIS THOUGHTS ARE HANDLE IN POSTGRESQL RELATIONAL DATABASE
class Thought(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id") # sets id, sets value as alias
    user_id: str = Field(...)
    thought: str = Field(...) # the main content
    created_at: Optional[str]
    class Config:
        orm_mode = True #This config is used for translating from MongoDB documents to data models
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str} #translates bson objects to strings