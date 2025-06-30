from sqlmodel import SQLModel, create_engine, Session
from dotenv import load_dotenv
import os
import time
import logging
from sqlalchemy.exc import OperationalError
from sqlalchemy import text
from typing import Generator

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Carregar variáveis de ambiente
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL não encontrada nas variáveis de ambiente")

# Configurações do engine
engine = create_engine(
    DATABASE_URL,
    echo=False,  # Set to True para debug SQL queries
    pool_pre_ping=True,  # Verifica conexões antes de usar
    pool_recycle=300,    # Recicla conexões a cada 5 minutos
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
)

def create_db_and_tables():
    """
    Cria todas as tabelas definidas nos modelos SQLModel
    """
    try:
        SQLModel.metadata.create_all(engine)
        logger.info("✅ Tabelas criadas/verificadas com sucesso!")
    except Exception as e:
        logger.error(f"❌ Erro ao criar tabelas: {str(e)}")
        raise

def get_session() -> Generator[Session, None, None]:
    """
    Dependency para obter sessão do banco de dados no FastAPI.
    
    Yields:
        Session: Sessão do SQLAlchemy
    """
    with Session(engine) as session:
        try:
            yield session
        except Exception as e:
            session.rollback()
            logger.error(f"Erro na sessão do banco: {str(e)}")
            raise
        finally:
            session.close()

def check_database_connection(retries: int = 3, delay: int = 2) -> bool:
    """
    Testa a conexão com o banco de dados.
    
    Args:
        retries (int): Número de tentativas de conexão
        delay (int): Tempo de espera entre tentativas em segundos
        
    Returns:
        bool: True se a conexão for bem-sucedida, False caso contrário
    """
    for attempt in range(retries):
        try:
            with Session(engine) as session:
                # Tenta executar uma consulta simples
                session.execute(text("SELECT 1"))
                logger.info("✅ Conexão com o banco de dados estabelecida com sucesso!")
                return True
        except OperationalError as e:
            if attempt < retries - 1:  # Não é a última tentativa
                logger.warning(
                    f"⚠️ Falha na conexão (tentativa {attempt + 1}/{retries}). "
                    f"Tentando novamente em {delay} segundos..."
                )
                time.sleep(delay)
            else:
                logger.error(
                    f"❌ Falha ao conectar ao banco de dados após {retries} tentativas."
                )
                logger.error(f"Erro: {str(e)}")
                return False
        except Exception as e:
            logger.error(f"❌ Erro inesperado na conexão: {str(e)}")
            return False
    return False

def init_db():
    """
    Inicializa o banco de dados: verifica conexão e cria tabelas
    """
    logger.info("Inicializando banco de dados...")
    
    if not check_database_connection():
        raise ConnectionError("Não foi possível estabelecer conexão com o banco de dados")
    
    create_db_and_tables()
    logger.info("✅ Banco de dados inicializado com sucesso!")

# Context manager para transações manuais (uso avançado)
class DatabaseTransaction:
    """
    Context manager para controle manual de transações
    """
    def __init__(self):
        self.session = None
    
    def __enter__(self) -> Session:
        self.session = Session(engine)
        return self.session
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        if exc_type is not None:
            self.session.rollback()
            logger.error(f"Transação revertida devido ao erro: {exc_val}")
        else:
            self.session.commit()
        self.session.close()

# Executar verificação apenas se rodado diretamente
if __name__ == "__main__":
    init_db()