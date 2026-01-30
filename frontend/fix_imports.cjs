
const fs = require('fs');
const path = require('path');

const walk = (dir, callback) => {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
    });
};

const srcDir = path.resolve(__dirname, 'src');

if (fs.existsSync(srcDir)) {
    walk(srcDir, (filePath) => {
        if (filePath.endsWith('.js') || filePath.endsWith('.jsx')) {
            let content = fs.readFileSync(filePath, 'utf8');
            let originalContent = content;

            // Replace .tsx with .jsx in imports
            content = content.replace(/(from|import)\s+['"]([^'"]+)\.tsx['"]/g, "$1 \"$2.jsx\"");
            content = content.replace(/(from|import)\s+['"]([^'"]+)\.ts['"]/g, "$1 \"$2.js\"");

            // Also dynamic imports
            content = content.replace(/import\(['"]([^'"]+)\.tsx['"]\)/g, "import(\"$1.jsx\")");
            content = content.replace(/import\(['"]([^'"]+)\.ts['"]\)/g, "import(\"$1.js\")");

            if (content !== originalContent) {
                console.log(`Updated imports in: ${filePath}`);
                fs.writeFileSync(filePath, content, 'utf8');
            }
        }
    });
    console.log('Finished fixing imports.');
} else {
    console.log('src directory not found!');
}
