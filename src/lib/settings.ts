import { db } from '@/lib/db'

export type CarouselStyle = 'original' | 'template1' | 'template2' | 'template3'

const VALID_STYLES: CarouselStyle[] = ['original', 'template1', 'template2', 'template3']

export async function getCarouselStyle(): Promise<CarouselStyle> {
  const setting = await db.siteSetting.findUnique({ where: { key: 'carousel_style' } })
  const value = setting?.value as CarouselStyle | undefined
  if (value && VALID_STYLES.includes(value)) {
    return value
  }
  return 'original'
}
