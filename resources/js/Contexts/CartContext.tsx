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
    is_flash_sale?: boolean;
    original_price?: number;
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

function loadUserItemsFromStorage(userId: number | null): CartItem[] {
    if (typeof window === 'undefined' || !userId) return [];
    try {
        const key = `juleha_cart_user_${userId}`;
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
    // Strict Shopee-style: Guests cannot have cart items in memory
    const [items, setItems] = useState<CartItem[]>(() => {
        if (!currentUserId) return [];
        return loadUserItemsFromStorage(currentUserId);
    });
    const [isCartOpen, setIsCartOpen] = useState(false);
    const activeUserIdRef = useRef<number | null>(currentUserId);

    // Watch for auth user changes (Login, Account Switch, Logout)
    useEffect(() => {
        if (currentUserId !== activeUserIdRef.current) {
            activeUserIdRef.current = currentUserId;
            setUserId(currentUserId);

            if (currentUserId) {
                // User logged in: load their personal isolated cart
                const userCart = loadUserItemsFromStorage(currentUserId);
                setItems(userCart);
            } else {
                // User logged out: clear memory immediately so no stale items leak to next user
                setItems([]);
            }
        }
    }, [currentUserId]);

    // Save cart strictly to current user's isolated storage ONLY when authenticated
    useEffect(() => {
        if (typeof window === 'undefined') return;
        if (!userId) return; // Do not save guest items
        try {
            const key = `juleha_cart_user_${userId}`;
            localStorage.setItem(key, JSON.stringify(items));
        } catch (e) {
            console.error('Failed to save cart to storage', e);
        }
    }, [items, userId]);

    const addToCart = (product: BuyerProduct, quantity: number = 1) => {
        // Strict Gate: Must be logged in to shop or add to cart
        if (!currentUserId && !userId) {
            alert('Silakan Masuk ke akun Anda terlebih dahulu untuk memasukkan barang ke keranjang dan mulai berbelanja.');
            router.visit(route('login'));
            return;
        }

        // Accurate Flash Sale vs Regular Price
        const isFlashSale = Boolean(product.is_flash_sale && product.flash_sale_price);
        const effectivePrice = isFlashSale
            ? Number(product.flash_sale_price)
            : Number(product.price);

        setItems((prevItems) => {
            const existingIndex = prevItems.findIndex((item) => item.id === product.id);
            if (existingIndex > -1) {
                const updated = [...prevItems];
                updated[existingIndex].quantity += quantity;
                updated[existingIndex].price = effectivePrice;
                return updated;
            } else {
                return [
                    ...prevItems,
                    {
                        id: product.id,
                        slug: product.slug,
                        title: product.title,
                        price: effectivePrice,
                        image_url: product.image_url,
                        weight_gram: product.weight_gram,
                        quantity,
                        seller_name: product.seller?.name || 'Mitra Penjual Juleha',
                        region_name: product.region_name || 'Jawa Timur',
                        is_flash_sale: isFlashSale,
                        original_price: Number(product.price),
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
        if (userId && typeof window !== 'undefined') {
            try {
                localStorage.removeItem(`juleha_cart_user_${userId}`);
            } catch (e) {
                console.error(e);
            }
        }
    };

    const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
    const totalPrice = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

    const openCart = () => {
        if (!currentUserId && !userId) {
            alert('Silakan Masuk ke akun Anda terlebih dahulu untuk melihat keranjang belanja.');
            router.visit(route('login'));
            return;
        }
        setIsCartOpen(true);
    };

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
