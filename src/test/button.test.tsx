import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Button } from '../components/ui/button'

describe('Button', () => {
    it('renders with children', () => {
        render(<Button>Click me</Button>)
        expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
    })

    it('applies variant classes correctly', () => {
        const { rerender } = render(<Button variant="default">Default</Button>)
        expect(screen.getByRole('button')).toHaveClass('bg-primary')

        rerender(<Button variant="destructive">Destructive</Button>)
        expect(screen.getByRole('button')).toHaveClass('bg-destructive')

        rerender(<Button variant="outline">Outline</Button>)
        expect(screen.getByRole('button')).toHaveClass('border')

        rerender(<Button variant="ghost">Ghost</Button>)
        expect(screen.getByRole('button')).toHaveClass('hover:bg-accent')
    })

    it('applies size classes correctly', () => {
        const { rerender } = render(<Button size="default">Default</Button>)
        expect(screen.getByRole('button')).toHaveClass('h-9')

        rerender(<Button size="sm">Small</Button>)
        expect(screen.getByRole('button')).toHaveClass('h-8')

        rerender(<Button size="lg">Large</Button>)
        expect(screen.getByRole('button')).toHaveClass('h-10')
    })

    it('can be disabled', () => {
        render(<Button disabled>Disabled</Button>)
        expect(screen.getByRole('button')).toBeDisabled()
    })
})
