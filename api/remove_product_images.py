import sys
import os
from sqlmodel import Session, select
from sqlalchemy import update

# Adiciona o diretório raiz do projeto ao sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import engine
from models.product import Product, ProductCategory
from models.category import Category
from models.brand import Brand

def main():
    product_ids_to_clear = [6, 9, 10, 12]
    
    with Session(engine) as session:
        try:
            # Define o campo 'images' como None para os produtos especificados
            statement = (
                update(Product)
                .where(Product.id.in_(product_ids_to_clear))
                .values(images=None)
            )
            
            result = session.execute(statement)
            session.commit()
            
            # rowcount informa quantas linhas foram afetadas
            if result.rowcount > 0:
                print(f"\n✅ Imagens de {result.rowcount} produto(s) (IDs: {product_ids_to_clear}) foram removidas com sucesso.")
            else:
                print(f"\n⚠️ Nenhum produto encontrado com os IDs: {product_ids_to_clear}. Nenhuma alteração foi feita.")

        except Exception as e:
            session.rollback()
            print(f"\n❌ Ocorreu um erro: {e}")

if __name__ == "__main__":
    main()
