from datetime import datetime, timezone
from typing import Optional, List, TYPE_CHECKING
from decimal import Decimal
from enum import Enum
from sqlmodel import SQLModel, Field, Relationship
from sqlalchemy import func

if TYPE_CHECKING:
    from models.brand import Brand
    from models.category import Category

# Enum para tipos de medida
class MeasureEnum(str, Enum):
    LITER = "l"
    MILLILITER = "ml"
    KILOGRAM = "kg"
    GRAM = "g"
    UNIT = "un"

# Tabela de relacionamento N:N entre produtos e categorias
class ProductCategory(SQLModel, table=True):
    __tablename__ = "product_categories"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    product_id: int = Field(foreign_key="products.id")
    category_id: int = Field(foreign_key="categories.id")
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        nullable=False
    )
    
    # Relacionamentos
    product: "Product" = Relationship(back_populates="product_categories")
    category: "Category" = Relationship(back_populates="product_categories")

class ProductBase(SQLModel):
    barcode: Optional[str] = Field(None, max_length=50, unique=True, index=True)
    name: str = Field(..., max_length=255)
    description: Optional[str] = Field(None)
    brand_id: Optional[int] = Field(None, foreign_key="brands.id")
    measure_type: Optional[MeasureEnum] = Field(None)
    measure_value: Optional[Decimal] = Field(None, max_digits=10, decimal_places=4)
    qtt: Optional[int] = Field(None)
    status: bool = Field(True)
    images: Optional[str] = Field(None)

class Product(ProductBase, table=True):
    __tablename__ = "products"
    
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
    
    # Relacionamentos
    brand: Optional["Brand"] = Relationship(back_populates="products")
    product_categories: List["ProductCategory"] = Relationship(back_populates="product")

class ProductCreate(ProductBase):
    category_ids: Optional[List[int]] = Field(default=None, description="IDs das categorias")

class ProductRead(ProductBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    # Informações da marca (se houver)
    brand: Optional["Brand"] = None
    
    # Lista de categorias
    categories: Optional[List["Category"]] = None

class ProductUpdate(SQLModel):
    barcode: Optional[str] = Field(None, max_length=50)
    name: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = Field(None)
    brand_id: Optional[int] = Field(None)
    measure_type: Optional[MeasureEnum] = Field(None)
    measure_value: Optional[Decimal] = Field(None, max_digits=10, decimal_places=4)
    qtt: Optional[int] = Field(None)
    status: Optional[bool] = Field(None)
    images: Optional[str] = Field(None)
    category_ids: Optional[List[int]] = Field(None, description="IDs das categorias")

    