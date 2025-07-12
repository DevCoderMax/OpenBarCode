from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ImageModel(BaseModel):
    object_name: str
    etag: str
    size: Optional[int] = None
    last_modified: Optional[datetime] = None
    url: Optional[str] = None
    product_id: Optional[int] = None

    class Config:
        orm_mode = True
