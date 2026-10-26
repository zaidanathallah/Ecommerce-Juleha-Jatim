import React, { createContext, useContext, useState, useEffect } from 'react';
import { BuyerProduct } from '@/types';

export interface CartItem {
    id: number;
    slug: string;
    title: string;
    price: number;
    image_url: string;
    weight_gram: number;
    quantity: number;
    seller_name: string;
    region_name: string;
}

interface CartContextType {
    items: CartItem[];
    addToCart: (product: BuyerProduct, quantity?: number) => void;
    removeFromCart: (id: number) => void;
    updateQuantity: (id: number, quantity: number) => void;
    clearCart: () => void;
    totalItems: number;
    totalPrice: number;
    isCartOpen: boolean;
    setIsCartOpen: (open: boolean) => void;
    openCart: () => void;
    closeCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>(() => {
        if (typeof window !== 'undefined') {
            try {
                const saved = localStorage.getItem('juleha_cart_v1');
                return saved ? JSON.parse(saved) : [];
            } catch (e) {
                console.error('Failed to load cart from storage', e);
                return [];
            }
        }
        return [];
    });

    const [isCartOpen, setIsCartOpen] = useState(false);

    useEffect(() => {
        try {
            localStorage.setItem('juleha_cart_v1', JSON.stringify(items));
        } catch (e) {
            console.error('Failed to save cart to storage', e);
        }
    }, [items]);

    const addToCart = (product: BuyerProduct, quantity: number = 1) => {
        setItems((prevItems) => {
            const existingIndex = prevItems.findIndex((item) => item.id === product.id);
            if (existingIndex > -1) {
                const updated = [...prevItems];
                updated[existingIndex].quantity += quantity;
                return updated;
            } else {
                return [
                    ...prevItems,
                    {
                        id: product.id,
                        slug: product.slug,
                        title: product.title,
                        price: product.price,
                        image_url: product.image_url,
                        weight_gram: product.weight_gram,
                        quantity,
                        seller_name: product.seller.name,
                        region_name: product.region_name,
                    },
                ];
            }
        });
        setIsCartOpen(true);
    };

    const removeFromCart = (id: number) => {
        setItems((prev) => prev.filter((item) => item.id !== id));
    };

    const updateQuantity = (id: number, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(id);
            return;
        }
        setItems((prev) =>
            prev.map((item) => (item.id === id ? { ...item, quantity } : item))
        );
    };

    const clearCart = () => {
        setItems([]);
    };

    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const openCart = () => setIsCartOpen(true);
    const closeCart = () => setIsCartOpen(false);

    return (
        <CartContext.Provider
            value={{
                items,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                totalItems,
                totalPrice,
                isCartOpen,
                setIsCartOpen,
                openCart,
                closeCart,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
