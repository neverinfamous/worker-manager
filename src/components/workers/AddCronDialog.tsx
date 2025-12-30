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

interface AddCronDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    workerName: string
    onConfirm: (cron: string) => void
    loading?: boolean
}

export function AddCronDialog({
    open,
    onOpenChange,
    workerName,
    onConfirm,
    loading = false,
}: AddCronDialogProps): React.ReactNode {
    const [cronExpression, setCronExpression] = useState('')
    const [error, setError] = useState('')

    const validateCron = (cron: string): boolean => {
        // Basic cron validation: 5 space-separated parts
        const parts = cron.trim().split(/\s+/)
        return parts.length === 5
    }

    const handleSubmit = (): void => {
        setError('')

        if (!cronExpression.trim()) {
            setError('Cron expression is required')
            return
        }

        if (!validateCron(cronExpression)) {
            setError('Invalid cron expression. Must have 5 fields: minute hour day month weekday')
            return
        }

        onConfirm(cronExpression.trim())
    }

    const handleOpenChange = (isOpen: boolean): void => {
        if (!isOpen) {
            setCronExpression('')
            setError('')
        }
        onOpenChange(isOpen)
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add Cron Trigger</DialogTitle>
                    <DialogDescription>
                        Schedule <code className="bg-muted px-1 rounded">{workerName}</code> to run on a schedule
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="cron-expression">Cron Expression</Label>
                        <Input
                            id="cron-expression"
                            placeholder="*/5 * * * *"
                            value={cronExpression}
                            onChange={(e) => { setCronExpression(e.target.value) }}
                            disabled={loading}
                            className="font-mono"
                        />
                        <div className="text-xs text-muted-foreground space-y-1">
                            <p>Format: minute hour day month weekday</p>
                            <p className="font-mono">Examples:</p>
                            <ul className="list-disc list-inside ml-2">
                                <li><code>*/5 * * * *</code> - Every 5 minutes</li>
                                <li><code>0 * * * *</code> - Every hour</li>
                                <li><code>0 0 * * *</code> - Daily at midnight</li>
                                <li><code>0 0 * * 0</code> - Weekly on Sunday</li>
                            </ul>
                        </div>
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
                        {loading ? 'Adding...' : 'Add Cron Trigger'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
