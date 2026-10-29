import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { router } from '@inertiajs/react';
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
    addToCart: (product: BuyerProduct, quantity?: number, userParam?: any) => void;
    buyNow: (product: BuyerProduct, quantity?: number, userParam?: any) => void;
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
    syncUser: (user: any) => void;
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

interface CartProviderProps {
    children: React.ReactNode;
    initialUser?: any;
}

export function CartProvider({ children, initialUser }: CartProviderProps) {
    const getInitialUser = () => {
        if (initialUser) return initialUser;
        if (typeof window !== 'undefined') {
            try {
                const appEl = document.getElementById('app');
                if (appEl?.dataset?.page) {
                    const parsed = JSON.parse(appEl.dataset.page);
                    if (parsed?.props?.auth?.user) return parsed.props.auth.user;
                }
            } catch (e) {}
        }
        return null;
    };

    const [currentUser, setCurrentUser] = useState<any>(getInitialUser);
    const activeUserIdRef = useRef<number | null>(currentUser?.id ?? null);

    // Strict Shopee-style: Guests cannot have cart items in memory
    const [items, setItems] = useState<CartItem[]>(() => {
        const uid = currentUser?.id ?? null;
        if (!uid) return [];
        return loadUserItemsFromStorage(uid);
    });

    const [isCartOpen, setIsCartOpen] = useState(false);

    const syncUser = (user: any) => {
        const newUid = user?.id ?? null;
        if (newUid !== activeUserIdRef.current) {
            activeUserIdRef.current = newUid;
            setCurrentUser(user);
            if (newUid) {
                setItems(loadUserItemsFromStorage(newUid));
            } else {
                setItems([]);
            }
        }
    };

    // Keep active user in sync across Inertia navigation, login, and logout
    useEffect(() => {
        const updateFromPage = (props: any) => {
            const pageUser = props?.auth?.user ?? null;
            syncUser(pageUser);
        };

        const removeSuccessListener = router.on('success', (event) => {
            updateFromPage(event.detail.page.props);
        });

        const removeNavigateListener = router.on('navigate', (event) => {
            updateFromPage(event.detail.page.props);
        });

        return () => {
            removeSuccessListener();
            removeNavigateListener();
        };
    }, []);

    // Save cart strictly to current user's isolated storage ONLY when authenticated
    useEffect(() => {
        if (typeof window === 'undefined') return;
        const uid = currentUser?.id;
        if (!uid) return; // Do not save guest items
        try {
            const key = `juleha_cart_user_${uid}`;
            localStorage.setItem(key, JSON.stringify(items));
        } catch (e) {
            console.error('Failed to save cart to storage', e);
        }
    }, [items, currentUser]);

    const getActiveUser = (explicitUser?: any) => {
        if (explicitUser?.id) return explicitUser;
        if (currentUser?.id) return currentUser;
        if (initialUser?.id) return initialUser;
        if (typeof window !== 'undefined') {
            try {
                const appEl = document.getElementById('app');
                if (appEl?.dataset?.page) {
                    const parsed = JSON.parse(appEl.dataset.page);
                    if (parsed?.props?.auth?.user) return parsed.props.auth.user;
                }
            } catch (e) {}
        }
        return null;
    };

    const addToCart = (product: BuyerProduct, quantity: number = 1, userParam?: any) => {
        const activeUser = getActiveUser(userParam);

        // Strict Gate: Must be logged in to shop or add to cart
        if (!activeUser || !activeUser.id) {
            alert('Silakan Masuk ke akun Anda terlebih dahulu untuk memasukkan barang ke keranjang dan mulai berbelanja.');
            router.visit(route('login'));
            return;
        }

        if (activeUser.id !== currentUser?.id) {
            syncUser(activeUser);
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

    const buyNow = (product: BuyerProduct, quantity: number = 1, userParam?: any) => {
        const activeUser = getActiveUser(userParam);

        if (!activeUser || !activeUser.id) {
            alert('Silakan Masuk ke akun Anda terlebih dahulu untuk mulai berbelanja.');
            router.visit(route('login'));
            return;
        }

        if (activeUser.id !== currentUser?.id) {
            syncUser(activeUser);
        }

        // Add to cart first
        addToCart(product, quantity, activeUser);

        // Immediate direct checkout
        router.visit(route('checkout.index', product.slug));
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
        const activeUser = getActiveUser();
        if (activeUser?.id && typeof window !== 'undefined') {
            try {
                localStorage.removeItem(`juleha_cart_user_${activeUser.id}`);
            } catch (e) {
                console.error(e);
            }
        }
    };

    const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
    const totalPrice = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

    const openCart = () => {
        const activeUser = getActiveUser();
        if (!activeUser || !activeUser.id) {
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
                buyNow,
                removeFromCart,
                updateQuantity,
                clearCart,
                totalItems,
                totalPrice,
                isCartOpen,
                setIsCartOpen,
                openCart,
                closeCart,
                currentUserId: currentUser?.id ?? null,
                syncUser,
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
