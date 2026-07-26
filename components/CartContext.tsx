"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useMemo,
  useState,
} from "react";

export type CartProduct = {
  name: string;
  price: number;
  image: string;
};

type CartItem = CartProduct & {
  quantity: number;
};

type CartContextType = {
  items: CartItem[];
  isOpen: boolean;
  totalItems: number;
  totalPrice: number;
  addToCart: (product: CartProduct) => void;
  increaseQuantity: (name: string) => void;
  decreaseQuantity: (name: string) => void;
  removeFromCart: (name: string) => void;
  openCart: () => void;
  closeCart: () => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const addToCart = (product: CartProduct) => {
    setItems((currentItems) => {
      const existingProduct = currentItems.find(
        (item) => item.name === product.name,
      );

      if (existingProduct) {
        return currentItems.map((item) =>
          item.name === product.name
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }

      return [...currentItems, { ...product, quantity: 1 }];
    });

    setIsOpen(true);
  };

  const increaseQuantity = (name: string) => {
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.name === name
          ? { ...item, quantity: item.quantity + 1 }
          : item,
      ),
    );
  };

  const decreaseQuantity = (name: string) => {
    setItems((currentItems) =>
      currentItems
        .map((item) =>
          item.name === name
            ? { ...item, quantity: item.quantity - 1 }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  const removeFromCart = (name: string) => {
    setItems((currentItems) =>
      currentItems.filter((item) => item.name !== name),
    );
  };

  const totalItems = useMemo(
    () => items.reduce((total, item) => total + item.quantity, 0),
    [items],
  );

  const totalPrice = useMemo(
    () =>
      items.reduce(
        (total, item) => total + item.price * item.quantity,
        0,
      ),
    [items],
  );

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        totalItems,
        totalPrice,
        addToCart,
        increaseQuantity,
        decreaseQuantity,
        removeFromCart,
        openCart: () => setIsOpen(true),
        closeCart: () => setIsOpen(false),
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return context;
}