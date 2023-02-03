export interface Listing {
  title: string | null;
  description: string | null;
  price: number | null; 
  shipping: number | null;
  currency: string | null; 
  site: string | null; 
  url: string | null;
  posted: Date | null;
  tags: string[];
  uid: string;
  inStock: boolean | null;
}
