import { FileCode, Settings, ExternalLink, Clock, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { type Worker } from '@/lib/api'
import { formatRelativeTime } from '@/lib/format'

interface WorkerCardProps {
    worker: Worker
    onSelect: (worker: Worker) => void
    onSettings?: (worker: Worker) => void
}

export function WorkerCard({ worker, onSelect, onSettings }: WorkerCardProps): React.ReactNode {
    const handlers = worker.handlers ?? []
    const hasScheduled = handlers.includes('scheduled')
    const hasFetch = handlers.includes('fetch')

    return (
        <div
            className="rounded-lg border bg-card p-4 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => { onSelect(worker) }}
            onKeyDown={(e) => { if (e.key === 'Enter') onSelect(worker) }}
            role="button"
            tabIndex={0}
        >
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                    <FileCode className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">{worker.name}</h3>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                        e.stopPropagation()
                        onSettings?.(worker)
                    }}
                >
                    <Settings className="h-4 w-4" />
                </Button>
            </div>

            <div className="mt-3 flex flex-wrap gap-1.5">
                {hasFetch && (
                    <Badge variant="secondary" className="gap-1">
                        <Zap className="h-3 w-3" />
                        HTTP
                    </Badge>
                )}
                {hasScheduled && (
                    <Badge variant="secondary" className="gap-1">
                        <Clock className="h-3 w-3" />
                        Cron
                    </Badge>
                )}
            </div>

            <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                <span>Updated {formatRelativeTime(worker.modified_on)}</span>
                <ExternalLink className="h-3.5 w-3.5" />
            </div>
        </div>
    )
}
