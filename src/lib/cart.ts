import { useState, useEffect } from 'react';

export interface CartItem {
  id: string;
  title: string;
  price_display: string;
  price: number; // numeric representation
  cover_image_url?: string;
  seller_id?: string;
  listing_type?: string;
  quantity: number;
}

const CART_KEY = 'rural_reckless_cart';

export function getCartItems(): CartItem[] {
  const data = localStorage.getItem(CART_KEY);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
}

export function addToCart(item: Omit<CartItem, 'quantity'>) {
  const current = getCartItems();
  const existing = current.find(i => i.id === item.id);
  if (existing) {
    existing.quantity += 1;
  } else {
    current.push({ ...item, quantity: 1 });
  }
  localStorage.setItem(CART_KEY, JSON.stringify(current));
  window.dispatchEvent(new Event('cart-updated'));
}

export function updateQuantity(id: string, quantity: number) {
  let current = getCartItems();
  if (quantity <= 0) {
    current = current.filter(i => i.id !== id);
  } else {
    const item = current.find(i => i.id === id);
    if (item) item.quantity = quantity;
  }
  localStorage.setItem(CART_KEY, JSON.stringify(current));
  window.dispatchEvent(new Event('cart-updated'));
}

export function removeFromCart(id: string) {
  const current = getCartItems().filter(i => i.id !== id);
  localStorage.setItem(CART_KEY, JSON.stringify(current));
  window.dispatchEvent(new Event('cart-updated'));
}

export function clearCart() {
  localStorage.removeItem(CART_KEY);
  window.dispatchEvent(new Event('cart-updated'));
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>(getCartItems());

  useEffect(() => {
    const handler = () => setItems(getCartItems());
    window.addEventListener('cart-updated', handler);
    return () => window.removeEventListener('cart-updated', handler);
  }, []);

  const total = items.reduce((acc, curr) => {
    return acc + curr.price * curr.quantity;
  }, 0);

  return { items, addToCart, removeFromCart, updateQuantity, clearCart, total };
}
