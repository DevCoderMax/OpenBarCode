from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlmodel import Session, select
from database import get_session
from models.product import Product, ProductCreate, ProductRead, ProductUpdate, ProductCategory, MeasureEnum
from models.brand import Brand
from models.category import Category

# Adicionado para resolver referências circulares (forward references) no Pydantic V2
# https://docs.pydantic.dev/latest/concepts/models/#circular-references
ProductRead.model_rebuild()


router = APIRouter(
    prefix="/products",
    tags=["products"],
    responses={404: {"description": "Product not found"}}
)

def _get_product_with_relations(session: Session, product_id: int) -> Optional[Product]:
    """Helper para buscar produto com relacionamentos"""
    return session.exec(
        select(Product)
        .where(Product.id == product_id)
    ).first()

def _build_product_response(session: Session, product: Product) -> ProductRead:
    """Helper para construir resposta com relacionamentos"""
    # Buscar brand
    brand = None
    if product.brand_id:
        brand = session.get(Brand, product.brand_id)
    
    # Buscar categorias
    categories = []
    product_categories = session.exec(
        select(ProductCategory).where(ProductCategory.product_id == product.id)
    ).all()
    
    for pc in product_categories:
        category = session.get(Category, pc.category_id)
        if category:
            categories.append(category)
    
    # Criar response
    product_dict = product.model_dump()
    product_dict["brand"] = brand
    product_dict["categories"] = categories
    
    return ProductRead(**product_dict)

@router.post("/", response_model=ProductRead, status_code=status.HTTP_201_CREATED)
def create_product(
    product_data: ProductCreate,
    session: Session = Depends(get_session)
):
    """Criar um novo produto"""
    # Verificar se barcode já existe (se fornecido)
    if product_data.barcode:
        existing_product = session.exec(
            select(Product).where(Product.barcode == product_data.barcode)
        ).first()
        
        if existing_product:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Product with this barcode already exists"
            )
    
    # Verificar se brand existe (se fornecido)
    if product_data.brand_id:
        brand = session.get(Brand, product_data.brand_id)
        if not brand:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Brand not found"
            )
    
    # Verificar se categorias existem (se fornecidas)
    category_ids = product_data.category_ids or []
    if category_ids:
        for category_id in category_ids:
            category = session.get(Category, category_id)
            if not category:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Category with id {category_id} not found"
                )
    
    # Criar produto (excluindo category_ids do model_validate)
    product_dict = product_data.model_dump(exclude={"category_ids"})
    product = Product.model_validate(product_dict)
    
    session.add(product)
    session.commit()
    session.refresh(product)
    
    # Criar relacionamentos com categorias
    for category_id in category_ids:
        product_category = ProductCategory(
            product_id=product.id,
            category_id=category_id
        )
        session.add(product_category)
    
    session.commit()
    
    return _build_product_response(session, product)

@router.get("/", response_model=List[ProductRead])
def list_products(
    skip: int = 0,
    limit: int = 100,
    status_filter: Optional[bool] = Query(None, alias="status"),
    brand_id: Optional[int] = None,
    category_id: Optional[int] = None,
    measure_type: Optional[MeasureEnum] = None,
    session: Session = Depends(get_session)
):
    """Listar produtos com filtros opcionais"""
    query = select(Product)
    
    # Aplicar filtros
    if status_filter is not None:
        query = query.where(Product.status == status_filter)
    
    if brand_id:
        query = query.where(Product.brand_id == brand_id)
    
    if measure_type:
        query = query.where(Product.measure_type == measure_type)
    
    # Filtro por categoria (mais complexo devido ao relacionamento N:N)
    if category_id:
        query = query.join(ProductCategory).where(ProductCategory.category_id == category_id)
    
    query = query.offset(skip).limit(limit)
    products = session.exec(query).all()
    
    return [_build_product_response(session, product) for product in products]

@router.get("/{product_id}", response_model=ProductRead)
def get_product(
    product_id: int,
    session: Session = Depends(get_session)
):
    """Obter um produto específico por ID"""
    product = _get_product_with_relations(session, product_id)
    
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    return _build_product_response(session, product)

@router.put("/{product_id}", response_model=ProductRead)
def update_product(
    product_id: int,
    product_data: ProductUpdate,
    session: Session = Depends(get_session)
):
    """Atualizar um produto existente"""
    product = session.get(Product, product_id)
    
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    # Verificar se novo barcode já existe (se fornecido)
    if product_data.barcode and product_data.barcode != product.barcode:
        existing_product = session.exec(
            select(Product).where(Product.barcode == product_data.barcode)
        ).first()
        
        if existing_product:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Product with this barcode already exists"
            )
    
    # Verificar se brand existe (se fornecido)
    if product_data.brand_id:
        brand = session.get(Brand, product_data.brand_id)
        if not brand:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Brand not found"
            )
    
    # Atualizar campos do produto (excluindo category_ids)
    product_dict = product_data.model_dump(exclude_unset=True, exclude={"category_ids"})
    for key, value in product_dict.items():
        setattr(product, key, value)
    
    # Atualizar categorias se fornecidas
    if product_data.category_ids is not None:
        # Verificar se categorias existem
        for category_id in product_data.category_ids:
            category = session.get(Category, category_id)
            if not category:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Category with id {category_id} not found"
                )
        
        # Remover relacionamentos existentes
        existing_relations = session.exec(
            select(ProductCategory).where(ProductCategory.product_id == product_id)
        ).all()
        
        for relation in existing_relations:
            session.delete(relation)
        
        # Criar novos relacionamentos
        for category_id in product_data.category_ids:
            product_category = ProductCategory(
                product_id=product_id,
                category_id=category_id
            )
            session.add(product_category)
    
    session.add(product)
    session.commit()
    session.refresh(product)
    
    return _build_product_response(session, product)

@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(
    product_id: int,
    session: Session = Depends(get_session)
):
    """Deletar um produto"""
    product = session.get(Product, product_id)
    
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    session.delete(product)
    session.commit()
    
    return None

@router.get("/search/", response_model=List[ProductRead])
def search_products(
    name: Optional[str] = None,
    barcode: Optional[str] = None,
    session: Session = Depends(get_session)
):
    """Buscar produtos por nome ou código de barras"""
    query = select(Product)
    
    if name:
        query = query.where(Product.name.ilike(f"%{name}%"))
    
    if barcode:
        query = query.where(Product.barcode.ilike(f"%{barcode}%"))
    
    if not name and not barcode:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least one search parameter (name or barcode) is required"
        )
    
    products = session.exec(query).all()
    
    return [_build_product_response(session, product) for product in products]

@router.get("/by-brand/{brand_id}", response_model=List[ProductRead])
def get_products_by_brand(
    brand_id: int,
    session: Session = Depends(get_session)
):
    """Obter todos os produtos de uma marca específica"""
    # Verificar se a marca existe
    brand = session.get(Brand, brand_id)
    if not brand:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Brand not found"
        )
    
    products = session.exec(
        select(Product).where(Product.brand_id == brand_id)
    ).all()
    
    return [_build_product_response(session, product) for product in products]

@router.get("/by-category/{category_id}", response_model=List[ProductRead])
def get_products_by_category(
    category_id: int,
    session: Session = Depends(get_session)
):
    """Obter todos os produtos de uma categoria específica"""
    # Verificar se a categoria existe
    category = session.get(Category, category_id)
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    
    products = session.exec(
        select(Product)
        .join(ProductCategory)
        .where(ProductCategory.category_id == category_id)
    ).all()
    
    return [_build_product_response(session, product) for product in products]