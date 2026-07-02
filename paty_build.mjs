// Build script para los bundles de isa-patyia modificados.
// Genera los .js en _dist/ a partir de los .jsx/.ts/.tsx originales.

import { build } from "esbuild";
import fs from "node:fs/promises";
import path from "node:path";

const root = "C:\\ContaPyme\\PatyIA\\temp\\paty_out";  // Base no importa, uso absoluto
const FRONTEND = "C:\\ContaPyme\\Personal\\apps\\isa-patyia\\frontend";
const DIST = path.join(FRONTEND, "_dist");

async function compileOne(srcRel, distRel) {
  const src = path.join(FRONTEND, srcRel);
  const out = path.join(DIST, distRel);
  await fs.mkdir(path.dirname(out), { recursive: true });

  const tmpFile = path.join("C:\\Users\\JAGUDELOE\\AppData\\Local\\Temp\\paty_build_out", path.basename(out));
  await fs.mkdir(path.dirname(tmpFile), { recursive: true });

  await build({
    entryPoints: [src],
    bundle: true,
    format: "esm",
    target: "es2020",
    platform: "browser",
    outfile: tmpFile,
    loader: { ".ts": "tsx", ".tsx": "tsx", ".js": "jsx", ".jsx": "jsx" },
    jsx: "automatic",
    jsxImportSource: "react",
    define: { "process.env.NODE_ENV": '"production"' },
    minify: false,
    legalComments: "none",
    logLevel: "warning",
    // Los bundles del proyecto usan importmap para React, Material UI, iconify.
    // Mantenerlos como import URLs externas, igual que los otros bundles.
    external: [
      "react", "react-dom", "react-dom/client", "react/jsx-runtime",
      "@emotion/react", "@emotion/styled",
      "@mui/material",
      "@mui/system",
      "@mui/utils",
      "@mui/base",
      "@mui/private-theming",
      "@mui/styled-engine",
      "iconify-icon",
    ],
  });

  const content = await fs.readFile(tmpFile, "utf8");
  await fs.unlink(tmpFile).catch(() => {});

  await fs.writeFile(out, content, "utf8");
  console.log(`OK  ${srcRel}  →  ${distRel}  (${content.length.toLocaleString()} bytes)`);
}

const jobs = [
  ["js/api/todosApi.ts", "js/api/todosApi.js"],
  ["js/api/sessionApi.ts", "js/api/sessionApi.js"],
  ["js/core/patyia.ts", "js/core/patyia.js"],
  ["js/core/platform.ts", "js/core/platform.js"],
  ["js/api/apiClient.ts", "js/api/apiClient.js"],
  ["js/app/App.jsx", "js/app/App.js"],
  ["js/tools/PermisosKanban.jsx", "js/tools/PermisosKanban.js"],
  ["js/tools/permisosKanbanShared.js", "js/tools/permisosKanbanShared.js"],
  ["js/tools/PermisosPanel.jsx", "js/tools/PermisosPanel.js"],
  ["js/tools/UserPermissionsSummaryDialog.jsx", "js/tools/UserPermissionsSummaryDialog.js"],
  ["js/tools/promptsSql/usePromptsSqlTool.ts", "js/tools/promptsSql/usePromptsSqlTool.js"],
  ["js/tools/roleHierarchy.js", "js/tools/roleHierarchy.js"],
  ["js/ui/treeView/index.ts", "js/ui/treeView/index.js"],
  ["js/ui/treeView/TreeView.tsx", "js/ui/treeView/TreeView.js"],
  ["js/ui/treeView/TreeRowItem.tsx", "js/ui/treeView/TreeRowItem.js"],
  ["js/ui/treeView/contracts.ts", "js/ui/treeView/contracts.js"],
  ["js/ui/treeView/treeData.ts", "js/ui/treeView/treeData.js"],
  ["js/ui/treeView/treeDrag.ts", "js/ui/treeView/treeDrag.js"],
  ["js/tools/roleHierarchyTree/index.ts", "js/tools/roleHierarchyTree/index.js"],
  ["js/tools/roleHierarchyTree/RoleHierarchyView.tsx", "js/tools/roleHierarchyTree/RoleHierarchyView.js"],
  ["js/tools/roleHierarchyTree/RolePermissionsEditor.tsx", "js/tools/roleHierarchyTree/RolePermissionsEditor.js"],
  ["js/tools/roleHierarchyTree/roleHierarchyTreeConfig.ts", "js/tools/roleHierarchyTree/roleHierarchyTreeConfig.js"],
  ["js/tools/roleHierarchyTree/treeLogic.ts", "js/tools/roleHierarchyTree/treeLogic.js"],
  ["js/tools/roleHierarchyTree/types.ts", "js/tools/roleHierarchyTree/types.js"],
];

for (const [src, dist] of jobs) {
  try { await compileOne(src, dist); }
  catch (e) { console.error(`FAIL ${src}: ${e.message}`); }
}

console.log("\n✅ Build completo.");
