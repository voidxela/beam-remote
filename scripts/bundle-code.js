// /scripts/bundle-code.js
const fs = require("fs");
const path = require("path");

// Configuration
const OUTPUT_DIR = "dist";
const OUTPUT_FILE = path.join(OUTPUT_DIR, "llm-bundle.txt");
const TARGET_PATHS = ["App.tsx", "src"]; // Files or directories to bundle
const ALLOWED_EXTENSIONS = [".ts", ".tsx", ".js", ".jsx", ".json"];
const IGNORE_DIRECTORIES = [
  "node_modules",
  ".expo",
  "assets",
  "android",
  "ios",
  "dist",
];

let bundleContent = "<project_code>\n";

function processPath(currentPath) {
  if (!fs.existsSync(currentPath)) {
    console.warn(`[Warning] Path not found: ${currentPath}`);
    return;
  }

  const stat = fs.statSync(currentPath);

  if (stat.isFile()) {
    const ext = path.extname(currentPath);
    if (ALLOWED_EXTENSIONS.includes(ext)) {
      const content = fs.readFileSync(currentPath, "utf8");
      // Normalize path separators for consistency
      const posixPath = currentPath.split(path.sep).join(path.posix.sep);
      bundleContent += `# /${posixPath}\n${content}\n\n`;
    }
  } else if (stat.isDirectory()) {
    const dirName = path.basename(currentPath);
    if (IGNORE_DIRECTORIES.includes(dirName)) {
      return;
    }

    const files = fs.readdirSync(currentPath);
    for (const file of files) {
      processPath(path.join(currentPath, file));
    }
  }
}

console.log("Bundling project code for AI context...");

// Execute the recursive walk
TARGET_PATHS.forEach((target) => processPath(target));

bundleContent += "</project_code>\n";

// Ensure the dist directory exists before writing
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Write the output file
fs.writeFileSync(OUTPUT_FILE, bundleContent, "utf8");

console.log(`✅ Successfully bundled code to ${OUTPUT_FILE}`);
