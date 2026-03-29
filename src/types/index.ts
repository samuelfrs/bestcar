export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  status: string;
  image_url: string | null;
  created_at: string;
}

export interface Lead {
  id: string;
  vehicle_id: string;
  customer_name: string;
  customer_phone: string;
  message: string | null;
  created_at: string;
}
