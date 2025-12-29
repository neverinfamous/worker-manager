export const badgeVariants = {
    default: 'border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80',
    secondary: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
    destructive: 'border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80',
    outline: 'text-foreground',
    success: 'border-transparent bg-green-500 text-white shadow hover:bg-green-500/80',
    warning: 'border-transparent bg-yellow-500 text-white shadow hover:bg-yellow-500/80',
}

export type BadgeVariant = keyof typeof badgeVariants
