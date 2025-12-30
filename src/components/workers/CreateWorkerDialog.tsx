import { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FileCode, Loader2 } from 'lucide-react'
import { createWorker } from '@/lib/api'

interface CreateWorkerDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onCreated: () => void
}

export function CreateWorkerDialog({
    open,
    onOpenChange,
    onCreated
}: CreateWorkerDialogProps): React.ReactNode {
    const [name, setName] = useState('')
    const [compatibilityDate, setCompatibilityDate] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault()

        if (!name.trim()) {
            setError('Worker name is required')
            return
        }

        // Validate worker name format
        if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(name) && name.length > 1) {
            setError('Name must be lowercase alphanumeric with hyphens, cannot start/end with hyphen')
            return
        }

        setLoading(true)
        setError(null)

        const response = await createWorker({
            name: name.trim(),
            compatibility_date: compatibilityDate || undefined,
        })

        setLoading(false)

        if (response.success) {
            setName('')
            setCompatibilityDate('')
            onOpenChange(false)
            onCreated()
        } else {
            setError(response.error ?? 'Failed to create worker')
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <form onSubmit={(e) => { void handleSubmit(e) }}>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <FileCode className="h-5 w-5" />
                            Create Worker
                        </DialogTitle>
                        <DialogDescription>
                            Create a new Cloudflare Worker script
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="worker-name">Worker Name</Label>
                            <Input
                                id="worker-name"
                                name="worker-name"
                                autoComplete="off"
                                placeholder="my-worker"
                                value={name}
                                onChange={(e) => { setName(e.target.value.toLowerCase()) }}
                                disabled={loading}
                            />
                            <p className="text-xs text-muted-foreground">
                                Lowercase letters, numbers, and hyphens only
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="compatibility-date">Compatibility Date (optional)</Label>
                            <Input
                                id="compatibility-date"
                                type="date"
                                value={compatibilityDate}
                                onChange={(e) => { setCompatibilityDate(e.target.value) }}
                                disabled={loading}
                            />
                            <p className="text-xs text-muted-foreground">
                                Controls which runtime features are available
                            </p>
                        </div>

                        {error && (
                            <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
                                {error}
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => { onOpenChange(false) }}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading || !name.trim()}>
                            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            Create Worker
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
