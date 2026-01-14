const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 8080;

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
            fontSrc: ["'self'", "https://cdnjs.cloudflare.com"],
            connectSrc: ["'self'"]
        }
    }
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: { error: 'Too many requests, please try again later.' }
});
app.use('/api', limiter);

// Basic middleware
app.use(compression());
app.use(morgan('combined'));
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use(express.static(path.join(__dirname)));

// Mock data for demonstration (replace with real database integration)
const mockData = {
    statistics: {
        online_players: 42,
        active_bans: 156,
        recent_violations: 23,
        total_bans: 1247,
        auto_bans: 892,
        manual_bans: 355,
        total_violations: 3421
    },
    bans: [
        {
            id: 1,
            license: "license:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
            steam: "steam:xxxxxxxxxxxxxxxx",
            discord: "discord:123456789012345678",
            reason: "Speed hacking - detected multiple violations",
            duration: 168,
            type: "auto",
            timestamp: Math.floor(Date.now() / 1000) - 86400,
            active: true
        },
        {
            id: 2,
            license: "license:yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy",
            steam: null,
            discord: null,
            reason: "Aimbot detection",
            duration: 720,
            type: "auto",
            timestamp: Math.floor(Date.now() / 1000) - 172800,
            active: true
        }
    ],
    violations: [
        {
            name: "JohnDoe",
            license: "license:zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz",
            type: "speed_hack",
            details: "Excessive speed detected (150 mph in city area)",
            count: 3,
            timestamp: Math.floor(Date.now() / 1000) - 3600
        },
        {
            name: "Player123",
            license: "license:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
            type: "health_hack",
            details: "Health regeneration above normal rate",
            count: 1,
            timestamp: Math.floor(Date.now() / 1000) - 7200
        }
    ],
    players: [
        {
            id: 1,
            name: "JohnDoe",
            license: "license:zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz",
            steam: "steam:zzzzzzzzzzzzzzzz",
            discord: "discord:987654321098765432",
            ping: 45
        },
        {
            id: 2,
            name: "Player123",
            license: "license:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
            steam: null,
            discord: null,
            ping: 67
        }
    ]
};

// API Routes
app.get('/api/statistics', (req, res) => {
    res.json({
        success: true,
        data: mockData.statistics
    });
});

app.get('/api/bans', (req, res) => {
    const { limit = 50, offset = 0, filter = 'all' } = req.query;
    let filteredBans = mockData.bans;
    
    if (filter !== 'all') {
        filteredBans = filteredBans.filter(ban => {
            switch(filter) {
                case 'active': return ban.active;
                case 'expired': return !ban.active;
                case 'auto': return ban.type === 'auto';
                case 'manual': return ban.type === 'manual';
                default: return true;
            }
        });
    }
    
    const paginatedBans = filteredBans.slice(parseInt(offset), parseInt(offset) + parseInt(limit));
    
    res.json({
        success: true,
        bans: paginatedBans,
        total: filteredBans.length
    });
});

app.post('/api/bans', (req, res) => {
    const newBan = {
        id: mockData.bans.length + 1,
        ...req.body,
        timestamp: Math.floor(Date.now() / 1000),
        active: true
    };
    
    mockData.bans.push(newBan);
    
    res.json({
        success: true,
        message: 'Ban created successfully',
        ban: newBan
    });
});

app.delete('/api/bans/:id', (req, res) => {
    const banId = parseInt(req.params.id);
    const banIndex = mockData.bans.findIndex(ban => ban.id === banId);
    
    if (banIndex !== -1) {
        mockData.bans[banIndex].active = false;
        res.json({
            success: true,
            message: 'Ban removed successfully'
        });
    } else {
        res.status(404).json({
            success: false,
            error: 'Ban not found'
        });
    }
});

app.get('/api/violations', (req, res) => {
    const { limit = 50, offset = 0, filter = 'all' } = req.query;
    let filteredViolations = mockData.violations;
    
    if (filter !== 'all') {
        filteredViolations = filteredViolations.filter(violation => violation.type === filter);
    }
    
    const paginatedViolations = filteredViolations.slice(parseInt(offset), parseInt(offset) + parseInt(limit));
    
    res.json({
        success: true,
        violations: paginatedViolations,
        total: filteredViolations.length
    });
});

app.get('/api/players', (req, res) => {
    res.json({
        success: true,
        players: mockData.players,
        total: mockData.players.length
    });
});

app.get('/api/activity', (req, res) => {
    const activity = [
        {
            type: 'ban',
            details: 'New ban added for speed hacking',
            timestamp: Math.floor(Date.now() / 1000) - 300
        },
        {
            type: 'violation',
            details: 'Speed hack detected - JohnDoe',
            timestamp: Math.floor(Date.now() / 1000) - 600
        },
        {
            type: 'system',
            details: 'Global ban sync completed',
            timestamp: Math.floor(Date.now() / 1000) - 900
        }
    ];
    
    res.json({
        success: true,
        activity: activity
    });
});

// Settings endpoint
app.get('/api/settings', (req, res) => {
    res.json({
        success: true,
        settings: {
            detection_enabled: true,
            auto_ban_enabled: true,
            global_ban_sync: true,
            max_violations: 3,
            ban_duration: 24,
            speed_check_enabled: true,
            health_check_enabled: true,
            teleport_check_enabled: true,
            weapon_check_enabled: true
        }
    });
});

app.put('/api/settings', (req, res) => {
    // In a real implementation, save settings to database
    console.log('Settings updated:', req.body);
    
    res.json({
        success: true,
        message: 'Settings saved successfully'
    });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        status: 'healthy',
        timestamp: new Date().toISOString()
    });
});

// Serve the main HTML file for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        error: 'Internal server error'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`FiveM Anti-Cheat Web Interface running on port ${PORT}`);
    console.log(`Access the dashboard at: http://localhost:${PORT}`);
});

module.exports = app;
