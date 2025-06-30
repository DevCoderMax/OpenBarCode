from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from database import get_session
from models.brand import Brand, BrandCreate, BrandRead, BrandUpdate

router = APIRouter(
    prefix="/brands",
    tags=["brands"],
    responses={404: {"description": "Brand not found"}}
)

@router.post("/", response_model=BrandRead, status_code=status.HTTP_201_CREATED)
def create_brand(
    brand_data: BrandCreate,
    session: Session = Depends(get_session)
):
    """Criar uma nova marca"""
    # Verificar se já existe uma marca com esse nome
    existing_brand = session.exec(
        select(Brand).where(Brand.name == brand_data.name)
    ).first()
    
    if existing_brand:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Brand with this name already exists"
        )
    
    # Criar nova marca
    brand = Brand.model_validate(brand_data)
    session.add(brand)
    session.commit()
    session.refresh(brand)
    
    return brand

@router.get("/", response_model=List[BrandRead])
def list_brands(
    skip: int = 0,
    limit: int = 100,
    session: Session = Depends(get_session)
):
    """Listar todas as marcas"""
    brands = session.exec(
        select(Brand).offset(skip).limit(limit)
    ).all()
    
    return brands

@router.get("/{brand_id}", response_model=BrandRead)
def get_brand(
    brand_id: int,
    session: Session = Depends(get_session)
):
    """Obter uma marca específica por ID"""
    brand = session.get(Brand, brand_id)
    
    if not brand:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Brand not found"
        )
    
    return brand

@router.put("/{brand_id}", response_model=BrandRead)
def update_brand(
    brand_id: int,
    brand_data: BrandUpdate,
    session: Session = Depends(get_session)
):
    """Atualizar uma marca existente"""
    brand = session.get(Brand, brand_id)
    
    if not brand:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Brand not found"
        )
    
    # Verificar se o novo nome já existe (se fornecido)
    if brand_data.name and brand_data.name != brand.name:
        existing_brand = session.exec(
            select(Brand).where(Brand.name == brand_data.name)
        ).first()
        
        if existing_brand:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Brand with this name already exists"
            )
    
    # Atualizar apenas os campos fornecidos
    brand_dict = brand_data.model_dump(exclude_unset=True)
    for key, value in brand_dict.items():
        setattr(brand, key, value)
    
    session.add(brand)
    session.commit()
    session.refresh(brand)
    
    return brand

@router.delete("/{brand_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_brand(
    brand_id: int,
    session: Session = Depends(get_session)
):
    """Deletar uma marca"""
    brand = session.get(Brand, brand_id)
    
    if not brand:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Brand not found"
        )
    
    session.delete(brand)
    session.commit()
    
    return None

@router.get("/search/", response_model=List[BrandRead])
def search_brands(
    name: str,
    session: Session = Depends(get_session)
):
    """Buscar marcas por nome (busca parcial)"""
    brands = session.exec(
        select(Brand).where(Brand.name.ilike(f"%{name}%"))
    ).all()
    
    return brands