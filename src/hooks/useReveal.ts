'use client'

import { useEffect, useRef, useState } from 'react'

export function useReveal() {
    const [isVisible, setIsVisible] = useState(false)
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true)
                    if (ref.current) observer.unobserve(ref.current)
                }
            },
            {
                threshold: 0.1, // Dispara quando 10% do elemento está visível
                rootMargin: '0px 0px -50px 0px' // Margem negativa para aparecer um pouco antes da borda real
            }
        )

        if (ref.current) {
            observer.observe(ref.current)
        }

        return () => {
            if (ref.current) {
                observer.unobserve(ref.current)
            }
        }
    }, [])

    return { ref, isVisible }
}
