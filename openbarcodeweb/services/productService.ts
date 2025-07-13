import { API_URL } from '../constants/Api';
import { Product } from '../models/Product';

export class ProductService {
  static async searchProduct(barcode: string): Promise<Product[]> {
    const response = await fetch(`${API_URL}/api/v1/products/search/?barcode=${barcode}`);
    
    if (!response.ok) {
      throw new Error('Falha ao buscar o produto.');
    }

    return response.json();
  }

  static async saveProduct(product: Product, isUpdate: boolean): Promise<Product> {
    const url = isUpdate
      ? `${API_URL}/api/v1/products/${product.id}`
      : `${API_URL}/api/v1/products/`;

    const method = isUpdate ? 'PUT' : 'POST';

    const productData: any = {
      ...product,
      measure_value: product.measure_value ? parseFloat(String(product.measure_value).replace(',', '.')) : undefined,
      qtt: product.qtt ? parseInt(String(product.qtt), 10) : undefined,
    };

    if (!isUpdate) {
      delete productData.id;
    }

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Falha ao salvar o produto');
    }

    return response.json();
  }

  static createEmptyProduct(barcode: string): Product {
    return {
      name: '',
      barcode,
      status: true,
      description: '',
      images: '',
      measure_type: 'un',
      measure_value: 0,
      qtt: 1,
    };
  }
}