import { useState, useEffect } from 'react'
import { Globe, Plus, RefreshCw, Search, Grid, List } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PageCard } from './PageCard'
import { PageDetailView } from './PageDetailView'
import { listPages, type PagesProject } from '@/lib/api'

export function PageListView(): React.ReactNode {
    const [pages, setPages] = useState<PagesProject[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedPage, setSelectedPage] = useState<PagesProject | null>(null)

    const fetchPages = async (skipCache = false): Promise<void> => {
        setLoading(true)
        setError(null)

        const response = await listPages({ skipCache })

        if (response.success && response.result) {
            setPages(response.result)
        } else {
            setError(response.error ?? 'Failed to load pages')
        }

        setLoading(false)
    }

    useEffect(() => {
        void fetchPages()
    }, [])

    const filteredPages = pages.filter((page) =>
        page.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        page.subdomain.toLowerCase().includes(searchQuery.toLowerCase())
    )

    // Show detail view if a page is selected
    if (selectedPage) {
        return (
            <PageDetailView
                page={selectedPage}
                onBack={() => { setSelectedPage(null) }}
                onRefresh={() => { void fetchPages(true) }}
            />
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Pages</h1>
                    <p className="text-muted-foreground">
                        Manage your Cloudflare Pages projects
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => { void fetchPages(true) }}
                        disabled={loading}
                    >
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    </Button>
                    <Button
                        className="gap-2"
                        onClick={() => {
                            // Open Cloudflare dashboard to create new project
                            window.open('https://dash.cloudflare.com/?to=/:account/pages/new', '_blank')
                        }}
                    >
                        <Plus className="h-4 w-4" />
                        Create Project
                    </Button>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        id="search-projects"
                        name="search-projects"
                        aria-label="Search projects"
                        placeholder="Search projects..."
                        value={searchQuery}
                        onChange={(e) => { setSearchQuery(e.target.value) }}
                        className="pl-9"
                    />
                </div>
                <div className="text-sm text-muted-foreground">
                    {filteredPages.length} of {pages.length} projects
                </div>
            </div>

            {error ? (
                <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive">
                    {error}
                </div>
            ) : (
                <Tabs defaultValue="grid" className="w-full">
                    <TabsList>
                        <TabsTrigger value="grid" className="gap-2">
                            <Grid className="h-4 w-4" />
                            Grid
                        </TabsTrigger>
                        <TabsTrigger value="list" className="gap-2">
                            <List className="h-4 w-4" />
                            List
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="grid" className="mt-4">
                        {loading ? (
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="h-36 rounded-lg border bg-muted animate-pulse" />
                                ))}
                            </div>
                        ) : filteredPages.length === 0 ? (
                            <div className="rounded-lg border p-8 text-center">
                                <Globe className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                                <p className="text-muted-foreground">
                                    {searchQuery ? 'No projects match your search' : 'No Pages projects found'}
                                </p>
                            </div>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {filteredPages.map((page) => (
                                    <PageCard
                                        key={page.id}
                                        page={page}
                                        onSelect={setSelectedPage}
                                    />
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="list" className="mt-4">
                        {loading ? (
                            <div className="space-y-2">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="h-16 rounded-lg border bg-muted animate-pulse" />
                                ))}
                            </div>
                        ) : filteredPages.length === 0 ? (
                            <div className="rounded-lg border p-8 text-center">
                                <Globe className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                                <p className="text-muted-foreground">
                                    {searchQuery ? 'No projects match your search' : 'No Pages projects found'}
                                </p>
                            </div>
                        ) : (
                            <div className="rounded-lg border divide-y">
                                {filteredPages.map((page) => (
                                    <div
                                        key={page.id}
                                        className="flex items-center justify-between p-4 hover:bg-muted/50 cursor-pointer"
                                        onClick={() => { setSelectedPage(page) }}
                                        onKeyDown={(e) => { if (e.key === 'Enter') setSelectedPage(page) }}
                                        role="button"
                                        tabIndex={0}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Globe className="h-5 w-5 text-primary" />
                                            <div>
                                                <p className="font-medium">{page.name}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {page.subdomain}.pages.dev
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            {page.production_branch}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            )}
        </div>
    )
}
