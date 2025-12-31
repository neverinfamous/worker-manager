import { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface CompatibilityDateDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    workerName: string
    currentDate: string
    onConfirm: (date: string) => void
    loading?: boolean
}

export function CompatibilityDateDialog({
    open,
    onOpenChange,
    workerName,
    currentDate,
    onConfirm,
    loading = false,
}: CompatibilityDateDialogProps): React.ReactNode {
    const [date, setDate] = useState(currentDate)
    const [error, setError] = useState('')

    const validateDate = (value: string): boolean => {
        // Format: YYYY-MM-DD
        const pattern = /^\d{4}-\d{2}-\d{2}$/
        if (!pattern.test(value)) return false

        const parsed = new Date(value)
        return !isNaN(parsed.getTime())
    }

    const handleSubmit = (): void => {
        setError('')

        if (!date.trim()) {
            setError('Compatibility date is required')
            return
        }

        if (!validateDate(date)) {
            setError('Invalid date format. Use YYYY-MM-DD')
            return
        }

        onConfirm(date)
    }

    const handleOpenChange = (isOpen: boolean): void => {
        if (isOpen) {
            setDate(currentDate)
            setError('')
        } else {
            setDate(currentDate)
            setError('')
        }
        onOpenChange(isOpen)
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Change Compatibility Date</DialogTitle>
                    <DialogDescription>
                        Update the compatibility date for <code className="bg-muted px-1 rounded">{workerName}</code>
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="compat-date">Compatibility Date</Label>
                        <Input
                            id="compat-date"
                            type="date"
                            value={date}
                            onChange={(e) => { setDate(e.target.value) }}
                            disabled={loading}
                        />
                        <p className="text-xs text-muted-foreground">
                            The compatibility date determines which runtime features are available.{' '}
                            <a
                                href="https://developers.cloudflare.com/workers/configuration/compatibility-dates/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline"
                            >
                                Learn more
                            </a>
                        </p>
                    </div>

                    {error && (
                        <p className="text-sm text-destructive">{error}</p>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => { handleOpenChange(false) }} disabled={loading}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading}>
                        {loading ? 'Saving...' : 'Save'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
