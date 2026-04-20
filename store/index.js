import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

/* ---------------------------- Auth Store ---------------------------- */
export const useAuth = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      setAuth: (user, token) => {
        if (typeof window !== 'undefined') localStorage.setItem('etrade_token', token);
        set({ user, token });
      },
      setUser: (user) => set({ user }),
      logout: () => {
        if (typeof window !== 'undefined') localStorage.removeItem('etrade_token');
        set({ user: null, token: null });
      },
      isAdmin: () => get().user?.role === 'admin',
    }),
    { name: 'etrade-auth', storage: createJSONStorage(() => localStorage) }
  )
);

/* ---------------------------- Cart Store ---------------------------- */
export const useCart = create(
  persist(
    (set, get) => ({
      items: [],
      add: (product, quantity = 1, variant = null) =>
        set((s) => {
          const key = product._id + JSON.stringify(variant || {});
          const existing = s.items.find((i) => i.key === key);
          if (existing) {
            return {
              items: s.items.map((i) =>
                i.key === key ? { ...i, quantity: i.quantity + quantity } : i
              ),
            };
          }
          return {
            items: [
              ...s.items,
              {
                key,
                product: product._id,
                name: product.name,
                slug: product.slug,
                image: product.images?.[0] || '',
                price: product.price,
                quantity,
                variant,
                stock: product.stock,
              },
            ],
          };
        }),
      update: (key, quantity) =>
        set((s) => ({
          items: s.items.map((i) =>
            i.key === key ? { ...i, quantity: Math.max(1, quantity) } : i
          ),
        })),
      remove: (key) => set((s) => ({ items: s.items.filter((i) => i.key !== key) })),
      clear: () => set({ items: [] }),
      subtotal: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      count: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: 'etrade-cart', storage: createJSONStorage(() => localStorage) }
  )
);

/* ---------------------------- Wishlist Store ---------------------------- */
export const useWishlist = create(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (id) =>
        set((s) => ({
          ids: s.ids.includes(id) ? s.ids.filter((x) => x !== id) : [...s.ids, id],
        })),
      has: (id) => get().ids.includes(id),
      clear: () => set({ ids: [] }),
    }),
    { name: 'etrade-wishlist', storage: createJSONStorage(() => localStorage) }
  )
);
