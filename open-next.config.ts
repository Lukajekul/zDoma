// OpenNext config for Cloudflare Workers. No incremental cache yet: pages are
// per-user and dynamic. Add the R2 cache later if static pages need it
// (https://opennext.js.org/cloudflare/caching).
import { defineCloudflareConfig } from "@opennextjs/cloudflare";

export default defineCloudflareConfig({});
