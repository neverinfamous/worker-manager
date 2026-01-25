/**
 * Worker types - Cloudflare Workers script metadata
 */
export interface Worker {
  id: string;
  name: string;
  created_on: string;
  modified_on: string;
  etag?: string;
  handlers?: string[];
  routes?: WorkerRoute[];
  // Local metadata from D1
  color?: string;
  notes?: string;
}

export interface WorkerRoute {
  id: string;
  pattern: string;
  zone_id?: string;
  zone_name?: string;
}

export interface WorkerDomain {
  id: string;
  zone_id: string;
  zone_name: string;
  hostname: string;
  service: string;
  environment: string;
}

export interface WorkerSecret {
  name: string;
  type: "secret_text";
}

export interface WorkerCronTrigger {
  cron: string;
  created_on: string;
  modified_on: string;
}

export interface WorkerBinding {
  name: string;
  type: string;
  bucket_name?: string; // R2
  database_id?: string; // D1
  namespace_id?: string; // KV
  class_name?: string; // DO
  queue_name?: string; // Queue
}

/**
 * Pages types - Cloudflare Pages project metadata
 */
export interface PagesProject {
  id: string;
  name: string;
  subdomain: string;
  created_on: string;
  production_branch: string;
  canonical_deployment?: PagesDeployment;
  latest_deployment?: PagesDeployment;
  domains?: string[];
  source?: {
    type: "github" | "gitlab" | "direct_upload";
    config?: {
      owner?: string;
      repo_name?: string;
      production_branch?: string;
    };
  };
  build_config?: PagesBuildConfig;
  // Local metadata from D1
  color?: string;
  notes?: string;
}

export interface PagesDeployment {
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
  deployment_trigger?: {
    type: "ad_hoc" | "github" | "gitlab" | "api";
    metadata?: {
      branch?: string;
      commit_hash?: string;
      commit_message?: string;
    };
  };
}

export interface PagesBuildConfig {
  build_command?: string;
  destination_dir?: string;
  root_dir?: string;
}

export interface PagesDomain {
  id: string;
  name: string;
  status: "active" | "pending" | "moved" | "deleted";
  zone_tag?: string;
  certificate_authority?: string;
  created_on: string;
}

/**
 * Common types
 */
export interface Job {
  id: string;
  operation_type: JobOperationType;
  entity_type: "worker" | "page";
  entity_id: string;
  entity_name: string;
  status: "running" | "success" | "failed";
  progress: number;
  item_count: number;
  started_at: string;
  completed_at?: string;
  error_message?: string;
  user_email?: string;
}

export type JobOperationType =
  | "create"
  | "update"
  | "delete"
  | "clone"
  | "export"
  | "import"
  | "backup"
  | "restore"
  | "deploy"
  | "rollback";

export interface JobEvent {
  id: number;
  job_id: string;
  event_type: string;
  message: string;
  timestamp: string;
}

export interface Webhook {
  id: string;
  name: string;
  url: string;
  events: WebhookEvent[];
  secret?: string;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export type WebhookEvent =
  | "worker_created"
  | "worker_updated"
  | "worker_deleted"
  | "worker_deployed"
  | "page_created"
  | "page_updated"
  | "page_deleted"
  | "page_deployed"
  | "job_completed"
  | "job_failed"
  | "backup_created"
  | "backup_restored";

export interface Backup {
  id: string;
  entity_type: "worker" | "page";
  entity_id: string;
  entity_name: string;
  r2_key: string;
  backup_type: "manual" | "pre_delete" | "scheduled";
  size_bytes: number;
  created_at: string;
  created_by?: string;
}

/**
 * Metrics types
 */
export interface WorkerMetrics {
  requests: number;
  success_rate: number;
  errors: number;
  cpu_time_p50: number;
  cpu_time_p90: number;
  cpu_time_p99: number;
  duration_p50: number;
  duration_p90: number;
  duration_p99: number;
}

export interface MetricsDataPoint {
  timestamp: string;
  requests: number;
  errors: number;
  cpu_time: number;
}

/**
 * API Response types
 */
export interface ApiResponse<T> {
  success: boolean;
  result?: T;
  errors?: ApiError[];
  messages?: string[];
}

export interface ApiError {
  code: number;
  message: string;
}
