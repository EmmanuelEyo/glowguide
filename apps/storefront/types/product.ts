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
  /** CSS gradient string — display placeholder until real images exist */
  gradient: string;
  /** Single emoji — decorative display placeholder */
  emoji: string;
}
