#!/usr/bin/env node
/**
 * Build script for Firefox extension.
 * Copies dist/ → dist-firefox/ and transforms manifest.json for Firefox MV3.
 */

const fs = require('fs');
const path = require('path');

const DIST = path.resolve(__dirname, '..', 'dist');
const DIST_FF = path.resolve(__dirname, '..', 'dist-firefox');
const GECKO_ID = 'composition-grid@ngocquy';

// ─── Copy directory recursively ──────────────────────────────────────────────
function copyDir(src, dest) {
    fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        if (entry.isDirectory()) {
            copyDir(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

// ─── Main ────────────────────────────────────────────────────────────────────
function main() {
    // 1. Verify dist/ exists
    if (!fs.existsSync(DIST)) {
        console.error('dist/ not found. Run "npm run build" first.');
        process.exit(1);
    }

    // 2. Clean & copy
    if (fs.existsSync(DIST_FF)) {
        fs.rmSync(DIST_FF, { recursive: true });
    }
    copyDir(DIST, DIST_FF);
    console.log('Copied dist/ → dist-firefox/');

    // 3. Transform manifest.json
    const manifestPath = path.join(DIST_FF, 'manifest.json');
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));

    // Shorten name for Firefox (max 45 characters)
    manifest.name = 'Composition Grid: Rule of Thirds & More';

    // Convert service_worker → background scripts (Firefox MV3 uses event pages)
    if (manifest.background?.service_worker) {
        const sw = manifest.background.service_worker;
        manifest.background = { scripts: [sw] };
    }

    // Add Firefox-specific settings
    manifest.browser_specific_settings = {
        gecko: {
            id: GECKO_ID,
            strict_min_version: '109.0', // Firefox 109+ supports MV3
            data_collection_permissions: {
                required: ['none'],
                optional: [],
            },
        },
    };

    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 4));
    console.log('Transformed manifest.json for Firefox');
    console.log(`  gecko.id: ${GECKO_ID}`);
    console.log('dist-firefox/ is ready!');
}

main();
