from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from database import get_session
from models.category import Category, CategoryCreate, CategoryRead, CategoryUpdate

router = APIRouter(
    prefix="/categories",
    tags=["categories"],
    responses={404: {"description": "Category not found"}}
)

@router.post("/", response_model=CategoryRead, status_code=status.HTTP_201_CREATED)
def create_category(
    category_data: CategoryCreate,
    session: Session = Depends(get_session)
):
    """Criar uma nova categoria"""
    # Verificar se já existe uma categoria com esse nome
    existing_category = session.exec(
        select(Category).where(Category.name == category_data.name)
    ).first()
    
    if existing_category:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Category with this name already exists"
        )
    
    # Criar nova categoria
    category = Category.model_validate(category_data)
    session.add(category)
    session.commit()
    session.refresh(category)
    
    return category

@router.get("/", response_model=List[CategoryRead])
def list_categories(
    skip: int = 0,
    limit: int = 100,
    session: Session = Depends(get_session)
):
    """Listar todas as categorias"""
    categories = session.exec(
        select(Category).offset(skip).limit(limit)
    ).all()
    
    return categories

@router.get("/{category_id}", response_model=CategoryRead)
def get_category(
    category_id: int,
    session: Session = Depends(get_session)
):
    """Obter uma categoria específica por ID"""
    category = session.get(Category, category_id)
    
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    
    return category

@router.put("/{category_id}", response_model=CategoryRead)
def update_category(
    category_id: int,
    category_data: CategoryUpdate,
    session: Session = Depends(get_session)
):
    """Atualizar uma categoria existente"""
    category = session.get(Category, category_id)
    
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    
    # Verificar se o novo nome já existe (se fornecido)
    if category_data.name and category_data.name != category.name:
        existing_category = session.exec(
            select(Category).where(Category.name == category_data.name)
        ).first()
        
        if existing_category:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Category with this name already exists"
            )
    
    # Atualizar apenas os campos fornecidos
    category_dict = category_data.model_dump(exclude_unset=True)
    for key, value in category_dict.items():
        setattr(category, key, value)
    
    session.add(category)
    session.commit()
    session.refresh(category)
    
    return category

@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(
    category_id: int,
    session: Session = Depends(get_session)
):
    """Deletar uma categoria"""
    category = session.get(Category, category_id)
    
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    
    session.delete(category)
    session.commit()
    
    return None

@router.get("/search/", response_model=List[CategoryRead])
def search_categories(
    name: str,
    session: Session = Depends(get_session)
):
    """Buscar categorias por nome (busca parcial)"""
    categories = session.exec(
        select(Category).where(Category.name.ilike(f"%{name}%"))
    ).all()
    
    return categories