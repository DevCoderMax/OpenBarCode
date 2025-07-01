from datetime import datetime, timezone
from typing import Optional, List, TYPE_CHECKING
from sqlmodel import SQLModel, Field, Relationship
from sqlalchemy import func

if TYPE_CHECKING:
    from models.product import Product

class BrandBase(SQLModel):
    name: str = Field(..., max_length=100, unique=True, index=True)

class Brand(BrandBase, table=True):
    __tablename__ = "brands"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        nullable=False
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        nullable=False,
        sa_column_kwargs={"onupdate": func.now()}
    )
    
    # Relacionamento com produtos
    products: List["Product"] = Relationship(back_populates="brand")

class BrandCreate(BrandBase):
    pass

class BrandRead(BrandBase):
    id: int
    created_at: datetime
    updated_at: datetime

class BrandUpdate(SQLModel):
    name: Optional[str] = Field(None, max_length=100)