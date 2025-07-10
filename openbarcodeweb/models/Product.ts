export interface Brand {
  id: number;
  name: string;
}

export interface Category {
  id: number;
  name: string;
}

export interface Product {
  id?: number;
  name: string;
  description?: string | null;
  barcode?: string | null;
  images?: string | null; 
  status: boolean;
  measure_type?: string | null;
  measure_value?: number | null;
  qtt?: number | null;
  brand_id?: number | null;
  brand?: Brand | null;
  category_ids?: number[];
  categories?: Category[];
}
