from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging
from contextlib import asynccontextmanager
import time
from routes.products import router as products_router

# Imports do projeto
from database import init_db, check_database_connection
from routes.brands import router as brands_router
from routes.categories import router as categories_router

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Lifespan events para FastAPI 0.93+
@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Gerencia o ciclo de vida da aplicação
    """
    # Startup
    logger.info("🚀 Iniciando aplicação...")
    try:
        init_db()
        logger.info("✅ Aplicação iniciada com sucesso!")
    except Exception as e:
        logger.error(f"❌ Erro ao inicializar aplicação: {str(e)}")
        raise
    
    yield
    
    # Shutdown
    logger.info("🛑 Encerrando aplicação...")

# Criar instância do FastAPI
app = FastAPI(
    title="Inventory Management API",
    description="API para gerenciamento de estoque com produtos, marcas e categorias",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Configurar CORS
# Middleware para remover a barra final das URLs
@app.middleware("http")
async def remove_trailing_slash(request: Request, call_next):
    if request.scope['path'].endswith('/') and request.scope['path'] != '/':
        request.scope['path'] = request.scope['path'].rstrip('/')
    response = await call_next(request)
    return response

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Em produção, especificar domínios permitidos
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Handler global para exceções
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error(f"Erro não tratado: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )

# Rotas principais
@app.get("/", tags=["root"])
async def root():
    """
    Endpoint raiz da API
    """
    return {
        "message": "Inventory Management API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs"
    }

@app.get("/health", tags=["health"])
async def health_check():
    """
    Endpoint para verificar saúde da aplicação
    """
    db_status = check_database_connection(retries=1)
    
    return {
        "status": "healthy" if db_status else "unhealthy",
        "database": "connected" if db_status else "disconnected",
        "version": "1.0.0"
    }

# Registrar routers
app.include_router(
    brands_router,
    prefix="/api/v1"
)

app.include_router(
    categories_router,
    prefix="/api/v1"
)

app.include_router(
    products_router,
    prefix="/api/v1"
)

# Middleware para logging de requests (opcional)
@app.middleware("http")
async def log_requests(request, call_next):
    """
    Middleware para log de todas as requisições
    """
    start_time = time.time()
    
    response = await call_next(request)
    
    process_time = time.time() - start_time
    logger.info(
        f"{request.method} {request.url.path} - "
        f"Status: {response.status_code} - "
        f"Time: {process_time:.4f}s"
    )
    
    return response

# Para desenvolvimento local
if __name__ == "__main__":
    import uvicorn
    import time
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )