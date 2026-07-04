'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

export type CartItem = {
  productId: string
  productName: string
  quantity: number
}

type CartContextType = {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  isCartOpen: boolean
  setIsCartOpen: (open: boolean) => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('calendula_cart')
        if (stored) return JSON.parse(stored)
      } catch { /* ignore parse errors */ }
    }
    return []
  })
  const [isCartOpen, setIsCartOpen] = useState(false)

  // Save to local storage on change
  useEffect(() => {
    localStorage.setItem('calendula_cart', JSON.stringify(items))
  }, [items])

  const addItem = (item: CartItem) => {
    setItems(prev => {
      const existing = prev.find(i => i.productId === item.productId)
      if (existing) {
        return prev.map(i => i.productId === item.productId ? { ...i, quantity: i.quantity + item.quantity } : i)
      }
      return [...prev, item]
    })
    setIsCartOpen(true)
  }

  const removeItem = (productId: string) => {
    setItems(prev => prev.filter(i => i.productId !== productId))
  }

  const updateQuantity = (productId: string, quantity: number) => {
    setItems(prev => prev.map(i => i.productId === productId ? { ...i, quantity: Math.max(1, quantity) } : i))
  }

  const clearCart = () => {
    setItems([])
  }

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, isCartOpen, setIsCartOpen }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
