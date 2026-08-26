import { describe, it, expect } from 'vitest'
import { fadeInUp, fadeInLeft, fadeInRight, staggerContainer, cardVariant, heroStagger, heroChild, scaleIn } from '@/lib/animations'

describe('animation variants', () => {
  it('fadeInUp has hidden and visible states', () => {
    expect(fadeInUp).toHaveProperty('hidden')
    expect(fadeInUp).toHaveProperty('visible')
    expect(fadeInUp.hidden).toEqual({ opacity: 0, y: 24 })
    expect(fadeInUp.visible).toHaveProperty('opacity', 1)
    expect(fadeInUp.visible).toHaveProperty('y', 0)
  })

  it('fadeInLeft has correct x offset', () => {
    expect(fadeInLeft.hidden).toEqual({ opacity: 0, x: -24 })
    expect(fadeInLeft.visible).toHaveProperty('x', 0)
  })

  it('fadeInRight has correct x offset', () => {
    expect(fadeInRight.hidden).toEqual({ opacity: 0, x: 24 })
    expect(fadeInRight.visible).toHaveProperty('x', 0)
  })

  it('staggerContainer configures child staggering', () => {
    expect(staggerContainer.visible).toHaveProperty('transition.staggerChildren', 0.08)
    expect(staggerContainer.visible).toHaveProperty('transition.delayChildren', 0.1)
  })

  it('cardVariant includes scale transform', () => {
    expect(cardVariant.hidden).toHaveProperty('scale', 0.97)
    expect(cardVariant.visible).toHaveProperty('scale', 1)
  })

  it('heroStagger has slower stagger', () => {
    expect(heroStagger.visible).toHaveProperty('transition.staggerChildren', 0.15)
    expect(heroStagger.visible).toHaveProperty('transition.delayChildren', 0.2)
  })

  it('heroChild has larger y offset', () => {
    expect(heroChild.hidden).toEqual({ opacity: 0, y: 40 })
  })

  it('scaleIn has scale transform', () => {
    expect(scaleIn.hidden).toEqual({ opacity: 0, scale: 0.9 })
    expect(scaleIn.visible).toHaveProperty('scale', 1)
  })
})
