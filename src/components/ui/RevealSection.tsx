'use client'

import { useReveal } from '@/hooks/useReveal'
import { ReactNode } from 'react'

interface RevealSectionProps {
    children: ReactNode
    className?: string
    delay?: string
}

export function RevealSection({ children, className = '', delay = '' }: RevealSectionProps) {
    const { ref, isVisible } = useReveal()

    return (
        <div
            ref={ref}
            className={`reveal ${isVisible ? 'reveal-visible' : ''} ${delay} ${className}`}
        >
            {children}
        </div>
    )
}
