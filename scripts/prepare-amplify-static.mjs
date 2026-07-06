import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const outDir = path.join(root, "out");
const bundleDir = path.join(root, ".amplify-hosting");
const staticDir = path.join(bundleDir, "static");

if (!existsSync(outDir)) {
  throw new Error("Missing out directory. Run `npm run build` before `npm run amplify:static`.");
}

await rm(bundleDir, { recursive: true, force: true });
await mkdir(staticDir, { recursive: true });
await cp(outDir, staticDir, { recursive: true });

const manifest = {
  version: 1,
  routes: [
    {
      path: "/_next/static/*",
      target: {
        kind: "Static",
        cacheControl: "public, max-age=31536000, immutable",
      },
    },
    {
      path: "/*.*",
      target: {
        kind: "Static",
        cacheControl: "public, max-age=31536000, immutable",
      },
    },
    {
      path: "/*",
      target: {
        kind: "Static",
        cacheControl: "public, max-age=0, must-revalidate",
      },
    },
  ],
  framework: {
    name: "Next.js",
    version: "16.2.10",
  },
};

await writeFile(
  path.join(bundleDir, "deploy-manifest.json"),
  `${JSON.stringify(manifest, null, 2)}\n`,
);

console.log("Prepared Amplify static deployment bundle at .amplify-hosting");
