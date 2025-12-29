import '@testing-library/jest-dom/vitest'

// Mock matchMedia for components that use it
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string): MediaQueryList => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: (): void => { /* deprecated */ },
        removeListener: (): void => { /* deprecated */ },
        addEventListener: (): void => { /* noop */ },
        removeEventListener: (): void => { /* noop */ },
        dispatchEvent: (): boolean => false,
    }),
})

// Mock IntersectionObserver
class MockIntersectionObserver implements IntersectionObserver {
    readonly root: Document | Element | null = null
    readonly rootMargin: string = ''
    readonly thresholds: readonly number[] = []

    observe(): void { /* noop */ }
    disconnect(): void { /* noop */ }
    unobserve(): void { /* noop */ }
    takeRecords(): IntersectionObserverEntry[] { return [] }
}

Object.defineProperty(window, 'IntersectionObserver', {
    writable: true,
    value: MockIntersectionObserver,
})

// Mock ResizeObserver
class MockResizeObserver implements ResizeObserver {
    observe(): void { /* noop */ }
    disconnect(): void { /* noop */ }
    unobserve(): void { /* noop */ }
}

Object.defineProperty(window, 'ResizeObserver', {
    writable: true,
    value: MockResizeObserver,
})
