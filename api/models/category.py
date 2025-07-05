from datetime import datetime, timezone
from typing import Optional, List, TYPE_CHECKING
from sqlmodel import SQLModel, Field, Relationship
from sqlalchemy import func

if TYPE_CHECKING:
    from models.product import ProductCategory

class CategoryBase(SQLModel):
    name: str = Field(..., max_length=100, unique=True, index=True)
    description: Optional[str] = Field(None)

class Category(CategoryBase, table=True):
    __tablename__ = "categories"
    
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
    
    # Relacionamento com produtos (através da tabela intermediária)
    product_categories: List["ProductCategory"] = Relationship(back_populates="category")

class CategoryCreate(CategoryBase):
    pass

class CategoryRead(CategoryBase):
    id: int
    created_at: datetime
    updated_at: datetime

class CategoryUpdate(SQLModel):
    name: Optional[str] = Field(None, max_length=100)
    description: Optional[str] = Field(None)