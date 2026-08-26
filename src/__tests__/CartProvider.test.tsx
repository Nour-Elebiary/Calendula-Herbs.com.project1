import React from 'react'
import { render, screen, act } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { CartProvider, useCart } from '@/components/public/CartProvider'

const TestComponent = () => {
  const { items, addItem, removeItem, clearCart, updateQuantity } = useCart()
  
  return (
    <div>
      <div data-testid="item-count">{items.length}</div>
      <button onClick={() => addItem({ productId: '1', productName: 'Test', quantity: 1, minOrderKg: 10 })}>
        Add Item
      </button>
      <button onClick={() => updateQuantity('1', 5)}>Update Quantity</button>
      <button onClick={() => removeItem('1')}>Remove Item</button>
      <button onClick={clearCart}>Clear</button>
    </div>
  )
}

describe('CartProvider', () => {
  it('adds item to cart', () => {
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    )
    
    expect(screen.getByTestId('item-count').textContent).toBe('0')
    
    act(() => {
      screen.getByText('Add Item').click()
    })
    
    expect(screen.getByTestId('item-count').textContent).toBe('1')
  })

  it('removes item from cart', () => {
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    )
    
    act(() => {
      screen.getByText('Add Item').click()
    })
    expect(screen.getByTestId('item-count').textContent).toBe('1')
    
    act(() => {
      screen.getByText('Remove Item').click()
    })
    expect(screen.getByTestId('item-count').textContent).toBe('0')
  })

  it('clears cart', () => {
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    )
    
    act(() => {
      screen.getByText('Add Item').click()
    })
    expect(screen.getByTestId('item-count').textContent).toBe('1')
    
    act(() => {
      screen.getByText('Clear').click()
    })
    expect(screen.getByTestId('item-count').textContent).toBe('0')
  })
})
