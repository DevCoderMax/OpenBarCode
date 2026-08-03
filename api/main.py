from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging
from contextlib import asynccontextmanager
import time
from starlette.types import ASGIApp, Receive, Scope, Send
from routes.products import router as products_router

# Imports do projeto
from database import init_db, check_database_connection
from routes.brands import router as brands_router
from routes.categories import router as categories_router
from routes.images import router as images_router


class StripTrailingSlashMiddleware:
    """Aceita URLs com ou sem barra final, sem emitir 307."""

    def __init__(self, app: ASGIApp):
        self.app = app

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] == "http":
            path = scope.get("path", "")
            if len(path) > 1 and path.endswith("/"):
                scope = dict(scope)
                scope["path"] = path.rstrip("/")
                if "raw_path" in scope:
                    scope["raw_path"] = scope["path"].encode("ascii")
        await self.app(scope, receive, send)

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
    lifespan=lifespan,
    redirect_slashes=False,
)

# Normaliza path antes do roteamento (evita 307 http atrás do proxy)
app.add_middleware(StripTrailingSlashMiddleware)

# Configurar CORS
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

app.include_router(
    images_router,
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