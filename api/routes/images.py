from typing import List
import os
import uuid
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Query
from fastapi.responses import StreamingResponse
from utils.MinioClient import MinioClient
from models.image import ImageModel
from PIL import Image
import io

router = APIRouter(
    prefix="/images",
    tags=["images"],
    responses={404: {"description": "Image not found"}}
)

# --- Dependências ---
minio_client = MinioClient()
BUCKET_NAME = os.getenv("MINIO_BUCKET_NAME", "openbarcode")

# Criar o bucket se não existir
minio_client.create_bucket(BUCKET_NAME)

# --- Funções Auxiliares ---

def get_minio_client():
    return minio_client

# --- Rotas ---

@router.post("/", response_model=ImageModel, status_code=status.HTTP_201_CREATED)
def upload_image(
    file: UploadFile = File(...),
    minio: MinioClient = Depends(get_minio_client)
):
    """Faz upload de uma imagem para o bucket."""
    try:
        # Gerar um nome de objeto único
        file_extension = os.path.splitext(file.filename)[1]
        object_name = f"{uuid.uuid4()}{file_extension}"

        # Fazer upload do stream
        result = minio.upload_file_stream(
            bucket_name=BUCKET_NAME,
            object_name=object_name,
            file_stream=file.file,
            file_size=file.size
        )
        
        # Obter metadados do objeto recém-criado
        image_data = minio.get_object(BUCKET_NAME, result["etag"])
        return ImageModel(**image_data)

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload image: {e}"
        )

@router.get("/", response_model=List[ImageModel])
def list_images(minio: MinioClient = Depends(get_minio_client)):
    """Lista todas as imagens no bucket."""
    try:
        objects = minio.list_objects(BUCKET_NAME)
        return [ImageModel(
            object_name=obj.object_name,
            etag=obj.etag,
            size=obj.size,
            last_modified=obj.last_modified
        ) for obj in objects]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list images: {e}"
        )

@router.get("/{etag}", response_model=ImageModel)
def get_image_details(etag: str, minio: MinioClient = Depends(get_minio_client)):
    """Obtém os metadados de uma imagem específica pelo ETag."""
    try:
        image_data = minio.get_object(BUCKET_NAME, etag)
        return ImageModel(**image_data)
    except FileNotFoundError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Image not found")
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get image details: {e}"
        )

@router.get("/download/{etag}")
def download_image(
    etag: str,
    w: int = Query(None, description='Largura do thumbnail'),
    h: int = Query(None, description='Altura do thumbnail'),
    quality: int = Query(85, description='Qualidade da imagem'),
    minio: MinioClient = Depends(get_minio_client)
):
    """Faz o download de uma imagem específica pelo ETag, com suporte a thumbnails."""
    try:
        # Este método precisa ser criado no MinioClient
        response, object_name, size = minio.get_object_stream_by_etag(BUCKET_NAME, etag)
        image_bytes = response.read()
        response.close()

        # Se não pediu redimensionamento, retorna a original
        if not w and not h:
            return StreamingResponse(
                io.BytesIO(image_bytes),
                media_type='image/jpeg',
                headers={
                    'Content-Disposition': f'attachment; filename="{object_name}"',
                    'Content-Length': str(len(image_bytes))
                }
            )

        # Redimensiona usando Pillow
        image = Image.open(io.BytesIO(image_bytes))
        image = image.convert('RGB')
        image.thumbnail((w or 256, h or 256))
        output = io.BytesIO()
        image.save(output, format='JPEG', quality=quality)
        output.seek(0)

        return StreamingResponse(
            output,
            media_type='image/jpeg',
            headers={
                'Content-Disposition': f'inline; filename="thumb_{object_name}"'
            }
        )
    except FileNotFoundError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Image not found")
    except Exception as e:
        # Fechar o stream em caso de erro
        if 'response' in locals() and hasattr(response, 'close'):
            response.close()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to download image: {e}"
        )

@router.delete("/{etag}", status_code=status.HTTP_204_NO_CONTENT)
def delete_image(etag: str, minio: MinioClient = Depends(get_minio_client)):
    """Deleta uma imagem específica pelo ETag."""
    try:
        minio.delete_object(BUCKET_NAME, etag)
        return None
    except FileNotFoundError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Image not found")
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete image: {e}"
        )
