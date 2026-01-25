/**
 * Worker environment types for worker-manager
 */

export interface Env {
  // D1 Database for metadata
  METADATA: D1Database;

  // R2 Bucket for backups
  BACKUP_BUCKET: R2Bucket;

  // KV Namespace for caching (optional)
  CACHE?: KVNamespace;

  // Static Assets (auto-injected by Wrangler)
  ASSETS: { fetch: (request: Request) => Promise<Response> };

  // Secrets
  ACCOUNT_ID: string;
  API_KEY: string;
  TEAM_DOMAIN: string;
  POLICY_AUD: string;
}

export const CF_API = "https://api.cloudflare.com/client/v4";

/**
 * Cloudflare API response types
 */
export interface CloudflareApiResponse<T = unknown> {
  success: boolean;
  result?: T;
  result_info?: {
    page: number;
    per_page: number;
    count: number;
    total_count: number;
  };
  errors?: Array<{
    code: number;
    message: string;
  }>;
  messages?: string[];
}

/**
 * Worker script metadata from Cloudflare API
 */
export interface WorkerScriptInfo {
  id: string;
  etag: string;
  handlers: string[];
  modified_on: string;
  created_on: string;
  usage_model?: string;
  compatibility_date?: string;
  compatibility_flags?: string[];
}

/**
 * Pages project metadata from Cloudflare API
 */
export interface PagesProjectInfo {
  id: string;
  name: string;
  subdomain: string;
  created_on: string;
  production_branch: string;
  canonical_deployment?: PagesDeploymentInfo;
  latest_deployment?: PagesDeploymentInfo;
  domains?: string[];
  source?: {
    type: "github" | "gitlab" | "direct_upload";
    config?: Record<string, unknown>;
  };
  build_config?: {
    build_command?: string;
    destination_dir?: string;
    root_dir?: string;
  };
}

export interface PagesDeploymentInfo {
  id: string;
  short_id: string;
  project_id: string;
  project_name: string;
  environment: "production" | "preview";
  url: string;
  created_on: string;
  modified_on: string;
  aliases?: string[];
  latest_stage?: {
    name: string;
    status: "success" | "failure" | "active" | "canceled" | "idle";
    started_on?: string;
    ended_on?: string;
  };
}

/**
 * Worker route configuration
 */
export interface WorkerRouteInfo {
  id: string;
  pattern: string;
  script?: string;
  zone_id?: string;
  zone_name?: string;
}

/**
 * Custom domain configuration
 */
export interface CustomDomainInfo {
  id: string;
  zone_id: string;
  zone_name: string;
  hostname: string;
  service: string;
  environment: string;
  status?: "active" | "pending" | "disabled";
}

/**
 * Cron trigger configuration
 */
export interface CronTriggerInfo {
  cron: string;
  created_on: string;
  modified_on: string;
}

/**
 * Job record from D1
 */
export interface JobRecord {
  id: string;
  operation_type: string;
  entity_type: "worker" | "page";
  entity_id: string | null;
  entity_name: string | null;
  status: "running" | "success" | "failed";
  progress: number;
  item_count: number;
  started_at: string;
  completed_at: string | null;
  error_message: string | null;
  user_email: string | null;
}

/**
 * Webhook record from D1
 */
export interface WebhookRecord {
  id: string;
  name: string;
  url: string;
  events: string; // JSON array
  secret: string | null;
  enabled: number; // 0 or 1
  created_at: string;
  updated_at: string;
}

/**
 * Backup record from D1
 */
export interface BackupRecord {
  id: string;
  entity_type: "worker" | "page";
  entity_id: string;
  entity_name: string;
  r2_key: string;
  backup_type: "manual" | "pre_delete" | "scheduled";
  size_bytes: number;
  created_at: string;
  created_by: string | null;
}
