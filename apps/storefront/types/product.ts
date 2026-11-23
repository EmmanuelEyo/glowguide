export interface Product {
  id: string;
  name: string;
  brand: string;
  description: string;
  price: number;
  category:
  | 'serums'
  | 'moisturisers'
  | 'toners'
  | 'spf'
  | 'cleansers'
  | 'eye-care'
  | 'masks';
  tags: string[];
  gradient: string;
  emoji: string;
}
