import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Trash2, Loader2, AlertTriangle } from 'lucide-react'

interface DeletePageDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    pageName: string
    onConfirm: () => void
    loading: boolean
}

export function DeletePageDialog({
    open,
    onOpenChange,
    pageName,
    onConfirm,
    loading
}: DeletePageDialogProps): React.ReactNode {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-destructive">
                        <AlertTriangle className="h-5 w-5" />
                        Delete Pages Project
                    </DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete <strong>{pageName}</strong>?
                        This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    <div className="rounded-lg bg-muted p-4 text-sm">
                        <p className="font-medium mb-2">This will:</p>
                        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                            <li>Delete the project and all deployments</li>
                            <li>Remove all custom domains</li>
                            <li>Delete all environment variables</li>
                            <li>Create a backup in R2 before deletion</li>
                        </ul>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => { onOpenChange(false) }}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={onConfirm}
                        disabled={loading}
                    >
                        {loading ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                            <Trash2 className="h-4 w-4 mr-2" />
                        )}
                        Delete Project
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
