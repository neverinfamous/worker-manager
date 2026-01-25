/**
 * Workers API routes
 */

import { type Env, CF_API } from "../types";
import { corsHeaders } from "../utils/cors";

interface WorkerScript {
  id: string;
  name?: string;
  etag: string;
  handlers: string[];
  modified_on: string;
  created_on: string;
  usage_model?: string;
  compatibility_date?: string;
  compatibility_flags?: string[];
}

// Hidden workers - these won't appear in the UI
// Add worker names here to hide them from the list
const hiddenWorkers = [
  "worker-manager",
  "r2",
  "kv-manager",
  "do-manager",
  "sqlite-wiki-search",
  "d1-manager",
  "container-manager",
  "adamic-blog",
  "do-test-worker",
];

export async function handleWorkersRoutes(
  request: Request,
  env: Env,
  url: URL,
  isLocal: boolean,
  _userEmail: string,
): Promise<Response> {
  const path = url.pathname;
  const method = request.method;

  // GET /api/workers - List all workers
  if (path === "/api/workers" && method === "GET") {
    return listWorkers(env, isLocal);
  }

  // POST /api/workers - Create new worker
  if (path === "/api/workers" && method === "POST") {
    const body = (await request.json()) as { name: string };
    return createWorker(env, body.name, isLocal);
  }

  // Match /api/workers/:name patterns
  const workerMatch = path.match(/^\/api\/workers\/([^/]+)$/);
  if (workerMatch) {
    const workerName = decodeURIComponent(workerMatch[1] ?? "");

    if (method === "GET") {
      return getWorker(env, workerName, isLocal);
    }
    if (method === "DELETE") {
      return deleteWorker(env, workerName);
    }
  }

  // GET /api/workers/:name/routes - List routes
  // POST /api/workers/:name/routes - Create a route
  const routesMatch = path.match(/^\/api\/workers\/([^/]+)\/routes$/);
  if (routesMatch) {
    const workerName = decodeURIComponent(routesMatch[1] ?? "");
    if (method === "GET") {
      return getWorkerRoutes(env, workerName, isLocal);
    }
    if (method === "POST") {
      const body = (await request.json()) as {
        pattern: string;
        zone_id: string;
      };
      return createWorkerRoute(env, workerName, body.pattern, body.zone_id);
    }
  }

  // DELETE /api/workers/:name/routes/:routeId - Delete a route
  const routeDeleteMatch = path.match(
    /^\/api\/workers\/([^/]+)\/routes\/([^/]+)$/,
  );
  if (routeDeleteMatch && method === "DELETE") {
    const routeId = decodeURIComponent(routeDeleteMatch[2] ?? "");
    // Get the zone_id from query param since routes are zone-specific
    const zoneId = url.searchParams.get("zone_id");
    if (!zoneId) {
      return new Response(
        JSON.stringify({
          success: false,
          errors: [{ message: "zone_id query parameter required" }],
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }
    return deleteWorkerRoute(env, routeId, zoneId);
  }

  // GET /api/zones - List available zones for route creation
  if (path === "/api/zones" && method === "GET") {
    return listZones(env, isLocal);
  }

  // GET /api/workers/:name/secrets
  const secretsMatch = path.match(/^\/api\/workers\/([^/]+)\/secrets$/);
  if (secretsMatch && method === "GET") {
    const workerName = decodeURIComponent(secretsMatch[1] ?? "");
    return getWorkerSecrets(env, workerName, isLocal);
  }

  // POST /api/workers/:name/clone
  const cloneMatch = path.match(/^\/api\/workers\/([^/]+)\/clone$/);
  if (cloneMatch && method === "POST") {
    const workerName = decodeURIComponent(cloneMatch[1] ?? "");
    const body = (await request.json()) as { name: string };
    return cloneWorker(env, workerName, body.name);
  }

  // GET/PATCH /api/workers/:name/settings - Get or update script settings
  const settingsMatch = path.match(/^\/api\/workers\/([^/]+)\/settings$/);
  if (settingsMatch) {
    const workerName = decodeURIComponent(settingsMatch[1] ?? "");
    if (method === "GET") {
      return getWorkerSettings(env, workerName, isLocal);
    }
    if (method === "PATCH") {
      const body = (await request.json()) as WorkerSettingsUpdate;
      return updateWorkerSettings(env, workerName, body);
    }
  }

  // GET/PUT /api/workers/:name/schedules - Cron triggers
  const schedulesMatch = path.match(/^\/api\/workers\/([^/]+)\/schedules$/);
  if (schedulesMatch) {
    const workerName = decodeURIComponent(schedulesMatch[1] ?? "");
    if (method === "GET") {
      return getWorkerSchedules(env, workerName, isLocal);
    }
    if (method === "PUT") {
      const body = (await request.json()) as {
        schedules: Array<{ cron: string }>;
      };
      return updateWorkerSchedules(env, workerName, body.schedules);
    }
  }

  // POST /api/workers/:name/secrets - Add a secret
  const secretsPostMatch = path.match(/^\/api\/workers\/([^/]+)\/secrets$/);
  if (secretsPostMatch && method === "POST") {
    const workerName = decodeURIComponent(secretsPostMatch[1] ?? "");
    const body = (await request.json()) as { name: string; value: string };
    return addWorkerSecret(env, workerName, body.name, body.value);
  }

  // DELETE /api/workers/:name/secrets/:secretName - Delete a secret
  const secretDeleteMatch = path.match(
    /^\/api\/workers\/([^/]+)\/secrets\/([^/]+)$/,
  );
  if (secretDeleteMatch && method === "DELETE") {
    const workerName = decodeURIComponent(secretDeleteMatch[1] ?? "");
    const secretName = decodeURIComponent(secretDeleteMatch[2] ?? "");
    return deleteWorkerSecret(env, workerName, secretName);
  }

  // GET/PUT /api/workers/:name/subdomain - workers.dev subdomain toggle
  const subdomainMatch = path.match(/^\/api\/workers\/([^/]+)\/subdomain$/);
  if (subdomainMatch) {
    const workerName = decodeURIComponent(subdomainMatch[1] ?? "");
    if (method === "GET") {
      return getWorkerSubdomain(env, workerName, isLocal);
    }
    if (method === "PUT") {
      const body = (await request.json()) as { enabled: boolean };
      return updateWorkerSubdomain(env, workerName, body.enabled);
    }
  }

  // GET /api/workers-subdomain - Get the account's workers.dev subdomain
  if (path === "/api/workers-subdomain" && method === "GET") {
    return getAccountSubdomain(env, isLocal);
  }

  return new Response(JSON.stringify({ error: "Not found" }), {
    status: 404,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function listWorkers(env: Env, isLocal: boolean): Promise<Response> {
  if (isLocal) {
    return new Response(
      JSON.stringify({
        success: true,
        result: [
          {
            id: "worker-1",
            name: "api-gateway",
            created_on: new Date(
              Date.now() - 7 * 24 * 60 * 60 * 1000,
            ).toISOString(),
            modified_on: new Date(
              Date.now() - 2 * 60 * 60 * 1000,
            ).toISOString(),
            handlers: ["fetch"],
          },
          {
            id: "worker-2",
            name: "auth-service",
            created_on: new Date(
              Date.now() - 30 * 24 * 60 * 60 * 1000,
            ).toISOString(),
            modified_on: new Date(
              Date.now() - 24 * 60 * 60 * 1000,
            ).toISOString(),
            handlers: ["fetch", "scheduled"],
          },
          {
            id: "worker-3",
            name: "image-processor",
            created_on: new Date(
              Date.now() - 14 * 24 * 60 * 60 * 1000,
            ).toISOString(),
            modified_on: new Date(
              Date.now() - 3 * 24 * 60 * 60 * 1000,
            ).toISOString(),
            handlers: ["fetch"],
          },
        ],
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  const response = await fetch(
    `${CF_API}/accounts/${env.ACCOUNT_ID}/workers/scripts`,
    {
      headers: {
        Authorization: `Bearer ${env.API_KEY}`,
        "Content-Type": "application/json",
      },
    },
  );

  const data = (await response.json()) as {
    success: boolean;
    result?: WorkerScript[];
    errors?: unknown[];
  };

  // Transform the response to add 'name' field from 'id' if not present
  // The Cloudflare API returns scripts where 'id' is the script name
  // Also filter out hidden workers
  if (data.success && data.result) {
    data.result = data.result
      .filter((script) => !hiddenWorkers.includes(script.id))
      .map((script) => ({
        ...script,
        name: script.id, // In CF API, the script id IS the name
      }));
  }

  return new Response(JSON.stringify(data), {
    status: response.ok ? 200 : response.status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function createWorker(
  env: Env,
  name: string,
  isLocal: boolean,
): Promise<Response> {
  if (isLocal) {
    return new Response(
      JSON.stringify({
        success: true,
        result: {
          id: name,
          name,
          created_on: new Date().toISOString(),
          modified_on: new Date().toISOString(),
          handlers: ["fetch"],
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  // Create a minimal worker script
  const workerScript = `export default {
  async fetch(request, env, ctx) {
    return new Response('Hello from ${name}!');
  },
};`;

  // Use multipart form data to upload the worker
  const formData = new FormData();

  // Add metadata
  const metadata = {
    main_module: "index.js",
    compatibility_date: "2024-12-01",
  };
  formData.append(
    "metadata",
    new Blob([JSON.stringify(metadata)], { type: "application/json" }),
  );

  // Add the worker script
  formData.append(
    "index.js",
    new Blob([workerScript], { type: "application/javascript+module" }),
    "index.js",
  );

  const response = await fetch(
    `${CF_API}/accounts/${env.ACCOUNT_ID}/workers/scripts/${name}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${env.API_KEY}`,
      },
      body: formData,
    },
  );

  const data = (await response.json()) as {
    success: boolean;
    result?: unknown;
    errors?: unknown[];
  };

  return new Response(JSON.stringify(data), {
    status: response.ok ? 200 : response.status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function getWorker(
  env: Env,
  name: string,
  isLocal: boolean,
): Promise<Response> {
  if (isLocal) {
    return new Response(
      JSON.stringify({
        success: true,
        result: {
          id: `worker-${name}`,
          name,
          created_on: new Date(
            Date.now() - 7 * 24 * 60 * 60 * 1000,
          ).toISOString(),
          modified_on: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          handlers: ["fetch"],
          compatibility_date: "2024-01-01",
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  const response = await fetch(
    `${CF_API}/accounts/${env.ACCOUNT_ID}/workers/scripts/${name}`,
    {
      headers: {
        Authorization: `Bearer ${env.API_KEY}`,
        "Content-Type": "application/json",
      },
    },
  );

  const data = (await response.json()) as {
    success: boolean;
    result?: WorkerScript;
    errors?: unknown[];
  };

  return new Response(JSON.stringify(data), {
    status: response.ok ? 200 : response.status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

interface ZoneRoute {
  id: string;
  pattern: string;
  script?: string;
}

async function getWorkerRoutes(
  env: Env,
  name: string,
  isLocal: boolean,
): Promise<Response> {
  if (isLocal) {
    return new Response(
      JSON.stringify({
        success: true,
        result: [
          {
            id: "route-1",
            pattern: `${name}.example.com/*`,
            zone_id: "mock-zone-id",
            zone_name: "example.com",
          },
        ],
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  // Routes are stored at the zone level, not the script level
  // We need to query all zones and aggregate routes for this worker
  try {
    // First, get all zones for the account
    const zonesResponse = await fetch(
      `${CF_API}/zones?account.id=${env.ACCOUNT_ID}&per_page=50`,
      {
        headers: {
          Authorization: `Bearer ${env.API_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    const zonesData = (await zonesResponse.json()) as {
      success: boolean;
      result?: Zone[];
    };

    if (!zonesData.success || !zonesData.result) {
      return new Response(
        JSON.stringify({
          success: true,
          result: [],
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // For each zone, get routes and filter by worker name
    const allRoutes: Array<{
      id: string;
      pattern: string;
      zone_id: string;
      zone_name: string;
    }> = [];

    for (const zone of zonesData.result) {
      const routesResponse = await fetch(
        `${CF_API}/zones/${zone.id}/workers/routes`,
        {
          headers: {
            Authorization: `Bearer ${env.API_KEY}`,
            "Content-Type": "application/json",
          },
        },
      );

      const routesData = (await routesResponse.json()) as {
        success: boolean;
        result?: ZoneRoute[];
      };

      if (routesData.success && routesData.result) {
        // Filter routes that belong to this worker
        const workerRoutes = routesData.result
          .filter((route) => route.script === name)
          .map((route) => ({
            id: route.id,
            pattern: route.pattern,
            zone_id: zone.id,
            zone_name: zone.name,
          }));

        allRoutes.push(...workerRoutes);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        result: allRoutes,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("[ROUTES] Error fetching worker routes:", error);
    return new Response(
      JSON.stringify({
        success: false,
        errors: [{ message: "Failed to fetch routes" }],
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
}

async function getWorkerSecrets(
  env: Env,
  name: string,
  isLocal: boolean,
): Promise<Response> {
  if (isLocal) {
    return new Response(
      JSON.stringify({
        success: true,
        result: [
          { name: "API_KEY", type: "secret_text" },
          { name: "DATABASE_URL", type: "secret_text" },
        ],
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  const response = await fetch(
    `${CF_API}/accounts/${env.ACCOUNT_ID}/workers/scripts/${name}/secrets`,
    {
      headers: {
        Authorization: `Bearer ${env.API_KEY}`,
        "Content-Type": "application/json",
      },
    },
  );

  const data = (await response.json()) as {
    success: boolean;
    result?: unknown[];
    errors?: unknown[];
  };

  return new Response(JSON.stringify(data), {
    status: response.ok ? 200 : response.status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function deleteWorker(env: Env, name: string): Promise<Response> {
  // TODO: Create R2 backup before deletion

  const response = await fetch(
    `${CF_API}/accounts/${env.ACCOUNT_ID}/workers/scripts/${name}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${env.API_KEY}`,
        "Content-Type": "application/json",
      },
    },
  );

  const data = (await response.json()) as {
    success: boolean;
    errors?: unknown[];
  };

  return new Response(JSON.stringify(data), {
    status: response.ok ? 200 : response.status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function cloneWorker(
  env: Env,
  sourceName: string,
  newName: string,
): Promise<Response> {
  // Step 1: Get the source worker settings to get main_module name and compatibility settings
  const settingsResponse = await fetch(
    `${CF_API}/accounts/${env.ACCOUNT_ID}/workers/scripts/${sourceName}/settings`,
    {
      headers: {
        Authorization: `Bearer ${env.API_KEY}`,
      },
    },
  );

  if (!settingsResponse.ok) {
    const errorText = await settingsResponse.text();
    console.error(
      "[CLONE] Failed to fetch source worker settings:",
      errorText.slice(0, 200),
    );
    return new Response(
      JSON.stringify({
        success: false,
        error: "Failed to fetch source worker settings",
      }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  const settingsData = (await settingsResponse.json()) as {
    result?: {
      compatibility_date?: string;
      compatibility_flags?: string[];
    };
  };

  const compatibilityDate =
    settingsData.result?.compatibility_date ?? "2024-12-01";
  const compatibilityFlags = settingsData.result?.compatibility_flags ?? [];

  // Step 2: Get the source worker script content
  // Use the regular endpoint which returns just JavaScript for simple workers
  const getResponse = await fetch(
    `${CF_API}/accounts/${env.ACCOUNT_ID}/workers/scripts/${sourceName}`,
    {
      headers: {
        Authorization: `Bearer ${env.API_KEY}`,
        Accept: "application/javascript",
      },
    },
  );

  if (!getResponse.ok) {
    const errorText = await getResponse.text();
    console.error(
      "[CLONE] Failed to fetch source worker script:",
      errorText.slice(0, 200),
    );
    return new Response(
      JSON.stringify({
        success: false,
        error: "Failed to fetch source worker script",
      }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  // The API returns multipart/form-data - parse it to get the script parts
  const sourceFormData = await getResponse.formData();

  // Debug: Log what parts we received
  const partNames: string[] = [];
  sourceFormData.forEach((_, name) => {
    partNames.push(name);
  });
  console.log("[CLONE] Received parts:", partNames.join(", "));

  // Find the main script file (usually index.js or worker.js)
  let mainModuleName = "index.js";
  let scriptValue: string | File | null = null;

  for (const [name, value] of sourceFormData.entries()) {
    if (name.endsWith(".js") || name.endsWith(".mjs")) {
      mainModuleName = name;
      scriptValue = value;
      console.log("[CLONE] Found main module:", name, "Type:", typeof value);
      break;
    }
  }

  if (!scriptValue) {
    // Fallback: try to get any file
    const firstEntry = sourceFormData.entries().next();
    if (!firstEntry.done) {
      mainModuleName = firstEntry.value[0];
      scriptValue = firstEntry.value[1];
      console.log("[CLONE] Using first part as main module:", mainModuleName);
    }
  }

  if (!scriptValue) {
    console.error("[CLONE] No script content found in response");
    return new Response(
      JSON.stringify({
        success: false,
        error: "No script content found in source worker",
      }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  // Step 3: Create new worker with the extracted script
  const newFormData = new FormData();

  // Add metadata for ES modules
  const metadata = {
    main_module: mainModuleName,
    compatibility_date: compatibilityDate,
    compatibility_flags: compatibilityFlags,
  };
  newFormData.append(
    "metadata",
    new Blob([JSON.stringify(metadata)], { type: "application/json" }),
  );

  // Handle both string and File/Blob values from FormData
  let scriptContent: string;
  if (typeof scriptValue === "string") {
    scriptContent = scriptValue;
  } else {
    // It's a File - read its content
    scriptContent = await (scriptValue as File).text();
  }
  const esModuleBlob = new Blob([scriptContent], {
    type: "application/javascript+module",
  });
  newFormData.append(mainModuleName, esModuleBlob, mainModuleName);

  const createResponse = await fetch(
    `${CF_API}/accounts/${env.ACCOUNT_ID}/workers/scripts/${newName}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${env.API_KEY}`,
      },
      body: newFormData,
    },
  );

  const data = (await createResponse.json()) as {
    success: boolean;
    result?: unknown;
    errors?: unknown[];
  };

  if (!createResponse.ok) {
    console.error(
      "[CLONE] Failed to create worker:",
      JSON.stringify(data.errors),
    );
  }

  return new Response(JSON.stringify(data), {
    status: createResponse.ok ? 200 : createResponse.status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// ============================================================================
// Settings, Schedules, Secrets Management
// ============================================================================

interface WorkerSettings {
  bindings: Array<{
    name: string;
    type: string;
    bucket_name?: string;
    database_id?: string;
    namespace_id?: string;
    class_name?: string;
    queue_name?: string;
  }>;
  usage_model?: string;
  compatibility_date?: string;
  compatibility_flags?: string[];
  logpush?: boolean;
  observability?: {
    enabled: boolean;
    head_sampling_rate?: number;
    traces?: {
      enabled: boolean;
      head_sampling_rate?: number;
    };
  };
  placement?: {
    mode: "off" | "smart";
    status?: string;
  };
  tail_consumers?: Array<{
    service: string;
    environment?: string;
    namespace?: string;
  }>;
}

interface WorkerSettingsUpdate {
  compatibility_date?: string;
  compatibility_flags?: string[];
  logpush?: boolean;
  observability?: {
    enabled?: boolean;
    head_sampling_rate?: number;
    traces?: {
      enabled?: boolean;
      head_sampling_rate?: number;
    };
  };
  placement?:
    | {
        mode: "smart";
      }
    | Record<string, never>
    | null;
  tail_consumers?: Array<{
    service: string;
    environment?: string;
  }>;
}

interface WorkerSchedule {
  cron: string;
  created_on: string;
  modified_on: string;
}

async function getWorkerSettings(
  env: Env,
  name: string,
  isLocal: boolean,
): Promise<Response> {
  if (isLocal) {
    return new Response(
      JSON.stringify({
        success: true,
        result: {
          bindings: [
            { name: "KV_STORE", type: "kv_namespace", namespace_id: "abc123" },
            { name: "MY_BUCKET", type: "r2_bucket", bucket_name: "my-bucket" },
            { name: "DB", type: "d1", database_id: "def456" },
          ],
          usage_model: "standard",
          compatibility_date: "2024-12-01",
          compatibility_flags: ["nodejs_compat"],
          logpush: false,
          observability: {
            enabled: false,
            head_sampling_rate: 0,
            traces: {
              enabled: false,
              head_sampling_rate: 0,
            },
          },
          placement: {
            mode: "off",
          },
          tail_consumers: [],
        } satisfies WorkerSettings,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  const response = await fetch(
    `${CF_API}/accounts/${env.ACCOUNT_ID}/workers/scripts/${name}/settings`,
    {
      headers: {
        Authorization: `Bearer ${env.API_KEY}`,
        "Content-Type": "application/json",
      },
    },
  );

  // Handle non-JSON responses gracefully
  const text = await response.text();
  let data: { success: boolean; result?: WorkerSettings; errors?: unknown[] };
  try {
    data = JSON.parse(text) as {
      success: boolean;
      result?: WorkerSettings;
      errors?: unknown[];
    };
  } catch {
    console.error("[SETTINGS] Failed to parse response:", text.slice(0, 200));
    return new Response(
      JSON.stringify({
        success: false,
        errors: [{ message: "Failed to fetch settings from Cloudflare API" }],
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  return new Response(JSON.stringify(data), {
    status: response.ok ? 200 : response.status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function updateWorkerSettings(
  env: Env,
  name: string,
  settings: WorkerSettingsUpdate,
): Promise<Response> {
  // Cloudflare API requires multipart/form-data with a "settings" part containing JSON
  const formData = new FormData();
  formData.append(
    "settings",
    new Blob([JSON.stringify(settings)], { type: "application/json" }),
  );

  const response = await fetch(
    `${CF_API}/accounts/${env.ACCOUNT_ID}/workers/scripts/${name}/settings`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${env.API_KEY}`,
      },
      body: formData,
    },
  );

  const text = await response.text();
  let data: { success: boolean; result?: WorkerSettings; errors?: unknown[] };
  try {
    data = JSON.parse(text) as {
      success: boolean;
      result?: WorkerSettings;
      errors?: unknown[];
    };
  } catch {
    console.error(
      "[UPDATE_SETTINGS] Failed to parse response:",
      text.slice(0, 200),
    );
    return new Response(
      JSON.stringify({
        success: false,
        errors: [{ message: "Failed to update settings" }],
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  return new Response(JSON.stringify(data), {
    status: response.ok ? 200 : response.status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function getWorkerSchedules(
  env: Env,
  name: string,
  isLocal: boolean,
): Promise<Response> {
  if (isLocal) {
    return new Response(
      JSON.stringify({
        success: true,
        result: {
          schedules: [
            {
              cron: "*/5 * * * *",
              created_on: new Date().toISOString(),
              modified_on: new Date().toISOString(),
            },
            {
              cron: "0 0 * * *",
              created_on: new Date().toISOString(),
              modified_on: new Date().toISOString(),
            },
          ],
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  const response = await fetch(
    `${CF_API}/accounts/${env.ACCOUNT_ID}/workers/scripts/${name}/schedules`,
    {
      headers: {
        Authorization: `Bearer ${env.API_KEY}`,
        "Content-Type": "application/json",
      },
    },
  );

  const data = (await response.json()) as {
    success: boolean;
    result?: { schedules: WorkerSchedule[] };
    errors?: unknown[];
  };

  return new Response(JSON.stringify(data), {
    status: response.ok ? 200 : response.status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function updateWorkerSchedules(
  env: Env,
  name: string,
  schedules: Array<{ cron: string }>,
): Promise<Response> {
  const response = await fetch(
    `${CF_API}/accounts/${env.ACCOUNT_ID}/workers/scripts/${name}/schedules`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${env.API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(schedules),
    },
  );

  const data = (await response.json()) as {
    success: boolean;
    result?: { schedules: WorkerSchedule[] };
    errors?: unknown[];
  };

  return new Response(JSON.stringify(data), {
    status: response.ok ? 200 : response.status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function addWorkerSecret(
  env: Env,
  workerName: string,
  secretName: string,
  secretValue: string,
): Promise<Response> {
  const response = await fetch(
    `${CF_API}/accounts/${env.ACCOUNT_ID}/workers/scripts/${workerName}/secrets`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${env.API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: secretName,
        text: secretValue,
        type: "secret_text",
      }),
    },
  );

  const data = (await response.json()) as {
    success: boolean;
    result?: unknown;
    errors?: unknown[];
  };

  return new Response(JSON.stringify(data), {
    status: response.ok ? 200 : response.status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function deleteWorkerSecret(
  env: Env,
  workerName: string,
  secretName: string,
): Promise<Response> {
  const response = await fetch(
    `${CF_API}/accounts/${env.ACCOUNT_ID}/workers/scripts/${workerName}/secrets/${secretName}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${env.API_KEY}`,
        "Content-Type": "application/json",
      },
    },
  );

  const data = (await response.json()) as {
    success: boolean;
    errors?: unknown[];
  };

  return new Response(JSON.stringify(data), {
    status: response.ok ? 200 : response.status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function getWorkerSubdomain(
  env: Env,
  name: string,
  isLocal: boolean,
): Promise<Response> {
  if (isLocal) {
    return new Response(
      JSON.stringify({
        success: true,
        result: { enabled: true },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  const response = await fetch(
    `${CF_API}/accounts/${env.ACCOUNT_ID}/workers/scripts/${name}/subdomain`,
    {
      headers: {
        Authorization: `Bearer ${env.API_KEY}`,
        "Content-Type": "application/json",
      },
    },
  );

  const data = (await response.json()) as {
    success: boolean;
    result?: { enabled: boolean };
    errors?: unknown[];
  };

  return new Response(JSON.stringify(data), {
    status: response.ok ? 200 : response.status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function updateWorkerSubdomain(
  env: Env,
  name: string,
  enabled: boolean,
): Promise<Response> {
  const response = await fetch(
    `${CF_API}/accounts/${env.ACCOUNT_ID}/workers/scripts/${name}/subdomain`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ enabled }),
    },
  );

  const data = (await response.json()) as {
    success: boolean;
    result?: { enabled: boolean };
    errors?: unknown[];
  };

  return new Response(JSON.stringify(data), {
    status: response.ok ? 200 : response.status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function getAccountSubdomain(
  env: Env,
  isLocal: boolean,
): Promise<Response> {
  if (isLocal) {
    return new Response(
      JSON.stringify({
        success: true,
        result: { subdomain: "your-account" },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  const response = await fetch(
    `${CF_API}/accounts/${env.ACCOUNT_ID}/workers/subdomain`,
    {
      headers: {
        Authorization: `Bearer ${env.API_KEY}`,
        "Content-Type": "application/json",
      },
    },
  );

  const text = await response.text();
  let data: {
    success: boolean;
    result?: { subdomain: string };
    errors?: unknown[];
  };
  try {
    data = JSON.parse(text) as {
      success: boolean;
      result?: { subdomain: string };
      errors?: unknown[];
    };
  } catch {
    console.error("[SUBDOMAIN] Failed to parse response:", text.slice(0, 200));
    return new Response(
      JSON.stringify({
        success: false,
        errors: [{ message: "Failed to fetch subdomain from Cloudflare API" }],
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  return new Response(JSON.stringify(data), {
    status: response.ok ? 200 : response.status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// ============================================================================
// Routes Management
// ============================================================================

interface Zone {
  id: string;
  name: string;
  status: string;
}

async function listZones(env: Env, isLocal: boolean): Promise<Response> {
  if (isLocal) {
    return new Response(
      JSON.stringify({
        success: true,
        result: [
          { id: "zone-1", name: "example.com", status: "active" },
          { id: "zone-2", name: "test.com", status: "active" },
        ],
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  const response = await fetch(`${CF_API}/zones?status=active&per_page=100`, {
    headers: {
      Authorization: `Bearer ${env.API_KEY}`,
      "Content-Type": "application/json",
    },
  });

  const text = await response.text();
  let data: { success: boolean; result?: Zone[]; errors?: unknown[] };
  try {
    data = JSON.parse(text) as {
      success: boolean;
      result?: Zone[];
      errors?: unknown[];
    };
  } catch {
    console.error("[ZONES] Failed to parse response:", text.slice(0, 200));
    return new Response(
      JSON.stringify({
        success: false,
        errors: [{ message: "Failed to fetch zones from Cloudflare API" }],
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  return new Response(JSON.stringify(data), {
    status: response.ok ? 200 : response.status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function createWorkerRoute(
  env: Env,
  workerName: string,
  pattern: string,
  zoneId: string,
): Promise<Response> {
  const response = await fetch(`${CF_API}/zones/${zoneId}/workers/routes`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      pattern,
      script: workerName,
    }),
  });

  const text = await response.text();
  let data: {
    success: boolean;
    result?: { id: string; pattern: string };
    errors?: unknown[];
  };
  try {
    data = JSON.parse(text) as {
      success: boolean;
      result?: { id: string; pattern: string };
      errors?: unknown[];
    };
  } catch {
    console.error(
      "[CREATE_ROUTE] Failed to parse response:",
      text.slice(0, 200),
    );
    return new Response(
      JSON.stringify({
        success: false,
        errors: [{ message: "Failed to create route" }],
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  return new Response(JSON.stringify(data), {
    status: response.ok ? 200 : response.status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function deleteWorkerRoute(
  env: Env,
  routeId: string,
  zoneId: string,
): Promise<Response> {
  const response = await fetch(
    `${CF_API}/zones/${zoneId}/workers/routes/${routeId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${env.API_KEY}`,
        "Content-Type": "application/json",
      },
    },
  );

  const text = await response.text();
  let data: { success: boolean; errors?: unknown[] };
  try {
    data = JSON.parse(text) as { success: boolean; errors?: unknown[] };
  } catch {
    console.error(
      "[DELETE_ROUTE] Failed to parse response:",
      text.slice(0, 200),
    );
    return new Response(
      JSON.stringify({
        success: false,
        errors: [{ message: "Failed to delete route" }],
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  return new Response(JSON.stringify(data), {
    status: response.ok ? 200 : response.status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
