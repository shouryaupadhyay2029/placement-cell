const fs = require('fs');
const path = require('path');

const root = path.join(__dirname);

function checkFiles(dir) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            if (file !== 'node_modules') checkFiles(fullPath);
        } else if (file.endsWith('.js')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            const lines = content.split('\n');
            lines.forEach((line, i) => {
                const match = line.match(/require\(['"](\..*?)['"]\)/);
                if (match) {
                    const reqPath = match[1];
                    // Try with .js or with folder/index.js
                    let target = path.join(path.dirname(fullPath), reqPath);
                    if (!fs.existsSync(target) && !fs.existsSync(target + '.js') && !fs.existsSync(path.join(target, 'index.js'))) {
                        console.error(`❌ FAILURE in ${fullPath}:${i+1} -> Missing: ${reqPath}`);
                    }
                }
            });
        }
    });
}

console.log('--- STARTING REQUIRE AUDIT ---');
checkFiles(root);
console.log('--- AUDIT COMPLETE ---');
process.exit(0);
