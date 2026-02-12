const fs = require('fs');
const path = require('path');

// Folder yang akan diproses
const targetDirs = [
    path.join(__dirname, 'app/routes'),
    path.join(__dirname, 'app/models'),
    path.join(__dirname, 'app/controllers')
];

// Definisi Pola "Komentar Tidak Perlu" (Regex)
// Hati-hati: Kita tidak ingin menghapus dokumentasi kode yang berguna.
// Kita targetkan kode yang di-comment out (dead code).
const patternsToRemove = [
    /^\s*\/\/\s*console\.log/,       // console.log yang di-comment
    /^\s*\/\/\s*(const|let|var|import|require|module\.exports)/, // Deklarasi variabel/import mati
    /^\s*\/\/\s*$/,                   // Baris komentar kosong
    /^\s*\/\/\s*TODO/,                // TODO items (opsional, seringkali dianggap hutang teknis yang ingin dibersihkan)
    /^\s*\/\/\s*FIXME/,
    /^\s*\/\/\s*function/,            // Fungsi mati
    /^\s*\/\/\s*class/,               // Class mati
    /^\s*\/\/\s*if\s*\(/,             // Logika if mati
    /^\s*\/\/\s*for\s*\(/,            // Loop mati
    /^\s*\/\/\s*return/               // Return mati
];

function isUnnecessaryComment(line) {
    for (const pattern of patternsToRemove) {
        if (pattern.test(line)) {
            return true;
        }
    }
    return false;
}

function processFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');
        const newLines = [];
        let changed = false;

        for (const line of lines) {
            if (isUnnecessaryComment(line)) {
                changed = true;
                // console.log(`[DELETE] ${path.basename(filePath)}: ${line.trim()}`);
            } else {
                newLines.push(line);
            }
        }

        if (changed) {
            fs.writeFileSync(filePath, newLines.join('\n'), 'utf8');
            console.log(`✅ Cleaned: ${path.relative(__dirname, filePath)}`);
        }
    } catch (err) {
        console.error(`❌ Error processing ${filePath}:`, err.message);
    }
}

function traverseDir(dir) {
    if (!fs.existsSync(dir)) {
        console.warn(`⚠️  Directory not found: ${dir}`);
        return;
    }
    
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
            traverseDir(fullPath);
        } else if (file.endsWith('.js')) {
            processFile(fullPath);
        }
    }
}

console.log('🧹 Memulai pembersihan komentar tidak perlu...');
targetDirs.forEach(dir => traverseDir(dir));
console.log('✨ Selesai.');
