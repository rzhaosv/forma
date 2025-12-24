#!/usr/bin/env node

/**
 * Simple Email Capture Server
 * Handles email submissions and stores them locally
 */

const http = require('http');
const fs = require('fs').promises;
const path = require('path');
const { existsSync } = require('fs');

const PORT = 3001;
const EMAILS_FILE = path.join(__dirname, 'emails.json');
const PUBLIC_DIR = __dirname;

// Initialize emails file if it doesn't exist
const initEmailsFile = async () => {
    try {
        if (!existsSync(EMAILS_FILE)) {
            await fs.writeFile(EMAILS_FILE, JSON.stringify({ emails: [], count: 0 }, null, 2));
            console.log('📧 Created emails.json file');
        }
    } catch (error) {
        console.warn('⚠️ Could not create local emails.json (likely read-only filesystem). Email capture will not persist.');
    }
};

// Read emails from file
const readEmails = async () => {
    try {
        const data = await fs.readFile(EMAILS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return { emails: [], count: 0 };
    }
};

// Save a temporary in-memory store for fallback
const memoryStore = { emails: [], count: 0 };

// Save email
const saveEmail = async (email) => {
    try {
        const data = await readEmails();

        // Check for duplicates
        const exists = data.emails.some(entry => entry.email === email);
        if (exists) {
            throw new Error('Email already registered');
        }

        // Add new email
        data.emails.push({
            email,
            timestamp: new Date().toISOString(),
            ip: null, // Privacy-friendly: not storing IPs
        });
        data.count = data.emails.length;

        await fs.writeFile(EMAILS_FILE, JSON.stringify(data, null, 2));
        return data.count;
    } catch (error) {
        if (error.message === 'Email already registered') throw error;

        console.warn('⚠️ File write failed, using memory store fallback:', error.message);
        memoryStore.emails.push({ email, timestamp: new Date().toISOString() });
        return memoryStore.emails.length;
    }
};

// Email validation
const isValidEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
};

// Serve static files
const serveStaticFile = async (req, res, filePath) => {
    try {
        const fullPath = path.join(PUBLIC_DIR, filePath);
        const ext = path.extname(fullPath);

        const contentTypes = {
            '.html': 'text/html',
            '.css': 'text/css',
            '.js': 'application/javascript',
            '.json': 'application/json',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.svg': 'image/svg+xml',
        };

        const contentType = contentTypes[ext] || 'text/plain';
        const content = await fs.readFile(fullPath);

        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
    } catch (error) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
};

// Create server
const server = http.createServer(async (req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // API Routes
    if (req.url === '/api/subscribe' && req.method === 'POST') {
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', async () => {
            try {
                const { email } = JSON.parse(body);

                if (!email || !isValidEmail(email)) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Invalid email address' }));
                    return;
                }

                const count = await saveEmail(email.toLowerCase());

                console.log(`✅ New subscriber: ${email} (Total: ${count})`);

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    success: true,
                    message: 'Successfully subscribed!',
                    count
                }));

            } catch (error) {
                console.error('Error:', error.message);

                if (error.message === 'Email already registered') {
                    res.writeHead(409, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'This email is already registered' }));
                } else {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Server error. Please try again.' }));
                }
            }
        });

        return;
    }

    // Get subscriber count
    if (req.url === '/api/count' && req.method === 'GET') {
        const data = await readEmails();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ count: data.count }));
        return;
    }

    // Export emails (admin only - add authentication in production!)
    if (req.url === '/api/export' && req.method === 'GET') {
        const data = await readEmails();
        res.writeHead(200, {
            'Content-Type': 'text/csv',
            'Content-Disposition': 'attachment; filename=subscribers.csv'
        });

        // Convert to CSV
        let csv = 'Email,Timestamp\n';
        data.emails.forEach(entry => {
            csv += `${entry.email},${entry.timestamp}\n`;
        });

        res.end(csv);
        return;
    }

    // Serve static files
    let filePath = req.url === '/' ? '/index.html' : req.url;
    await serveStaticFile(req, res, filePath);
});

// Start server
const start = async () => {
    await initEmailsFile();

    server.listen(PORT, () => {
        console.log('\n' + '='.repeat(50));
        console.log('🚀 EMAIL CAPTURE SERVER RUNNING');
        console.log('='.repeat(50));
        console.log(`📧 Landing Page:  http://localhost:${PORT}`);
        console.log(`📊 API Endpoint:  http://localhost:${PORT}/api/subscribe`);
        console.log(`📈 Export CSV:    http://localhost:${PORT}/api/export`);
        console.log(`📁 Emails saved:  ${EMAILS_FILE}`);
        console.log('='.repeat(50) + '\n');
        console.log('💡 Press Ctrl+C to stop\n');
    });
};

start().catch(error => {
    console.error('Failed to start server:', error);
    process.exit(1);
});

