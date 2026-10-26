import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { usePage, router } from '@inertiajs/react';
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
    currentUserId: number | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function getStorageKey(userId: number | null): string {
    return userId ? `juleha_cart_user_${userId}` : 'juleha_cart_guest';
}

function loadItemsFromStorage(userId: number | null): CartItem[] {
    if (typeof window === 'undefined') return [];
    try {
        const key = getStorageKey(userId);
        const saved = localStorage.getItem(key);
        return saved ? JSON.parse(saved) : [];
    } catch (e) {
        console.error('Failed to load cart from storage', e);
        return [];
    }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
    let currentUserId: number | null = null;
    try {
        const page = usePage();
        currentUserId = (page?.props as any)?.auth?.user?.id ?? null;
    } catch {
        currentUserId = null;
    }

    const [userId, setUserId] = useState<number | null>(currentUserId);
    const [items, setItems] = useState<CartItem[]>(() => loadItemsFromStorage(currentUserId));
    const [isCartOpen, setIsCartOpen] = useState(false);
    const activeUserIdRef = useRef<number | null>(currentUserId);

    // Sync cart when user logs in, switches accounts, or logs out
    useEffect(() => {
        const unregister = router.on('finish', () => {
            try {
                // Read fresh props after inertia navigation
                const page = (window as any)?.__inertia_page_props__ || null;
                // or safely through DOM/Inertia state
            } catch {
                // ignore
            }
        });
        return () => unregister();
    }, []);

    // Watch for auth user changes
    useEffect(() => {
        if (currentUserId !== activeUserIdRef.current) {
            activeUserIdRef.current = currentUserId;
            setUserId(currentUserId);
            // Load the newly authenticated user's cart (or clean guest cart on logout)
            const freshItems = loadItemsFromStorage(currentUserId);
            setItems(freshItems);
        }
    }, [currentUserId]);

    // Save cart strictly to current user's isolated storage
    useEffect(() => {
        if (typeof window === 'undefined') return;
        try {
            const key = getStorageKey(userId);
            localStorage.setItem(key, JSON.stringify(items));
        } catch (e) {
            console.error('Failed to save cart to storage', e);
        }
    }, [items, userId]);

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
                        seller_name: product.seller?.name || 'Mitra Penjual Juleha',
                        region_name: product.region_name || 'Jawa Timur',
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
        if (typeof window !== 'undefined') {
            try {
                localStorage.removeItem(getStorageKey(userId));
            } catch {
                // ignore
            }
        }
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
                currentUserId: userId,
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
