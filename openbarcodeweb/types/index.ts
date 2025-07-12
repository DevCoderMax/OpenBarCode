export interface Brand {
  id: number;
  name: string;
  logo_url?: string;
}

export interface Category {
  id: number;
  name: string;
}

export interface Image {
  object_name: string;
  etag: string;
  size: number;
  last_modified: string;
}

export interface Product {
  id: number;
  name: string;
  barcode: string;
  description: string | null;
  images: string | null;
  status: boolean;
  brand_id: number;
  measure_type: string | null;
  measure_value: string | null;
  qtt: number;
  created_at: string;
  updated_at: string;
  brand: Brand | null;
  categories: Category[];
}
