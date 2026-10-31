import { brand } from '@letterncms/sdk'
import { cn } from '../ui'

/** The product's mark, brand/mark.svg. */
export function BrandMark({ size = 22, className }: { size?: number; className?: string }) {
  return <img src={brand().mark} width={size} height={size} alt="" className={cn('shrink-0', className)} />
}
