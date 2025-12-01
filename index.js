const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// Initialize Supabase
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

// ============================================
// CRASH REPORTS ENDPOINTS
// ============================================

// POST - Single crash report
app.post('/api/crash-reports', async (req, res) => {
    try {
        const { message, stack, userAgent, timestamp, url } = req.body;
        const deviceId = req.headers['x-device-id'] || 'unknown';

        const { data, error } = await supabase
            .from('crash_reports')
            .insert([{
                message: message || 'Unknown error',
                stack: stack || 'unknown',
                userAgent: userAgent || '',
                timestamp: timestamp || new Date().toISOString(),
                url: url || '',
                device_id: deviceId,
                status: 'new'
            }]);

        if (error) throw error;
        res.json({ success: true, data });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// POST - Batch crash reports
app.post('/api/crash-reports/batch', async (req, res) => {
    try {
        const { reports } = req.body;
        const deviceId = req.headers['x-device-id'] || 'unknown';

        if (!Array.isArray(reports) || reports.length === 0) {
            return res.json({ success: true, count: 0 });
        }

        const data = reports.map(r => ({
            message: r.message || 'Unknown error',
            stack: r.stack || 'unknown',
            userAgent: r.userAgent || '',
            timestamp: r.timestamp || new Date().toISOString(),
            url: r.url || '',
            device_id: deviceId,
            status: 'new'
        }));

        const { error } = await supabase
            .from('crash_reports')
            .insert(data);

        if (error) throw error;
        res.json({ success: true, count: reports.length });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// GET - All crash reports
app.get('/api/crash-reports', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('crash_reports')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(100);

        if (error) throw error;
        res.json({ success: true, data });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// ANALYTICS ENDPOINTS
// ============================================

// POST - Single analytics event
app.post('/api/analytics', async (req, res) => {
    try {
        const { event, meta, timestamp } = req.body;
        const deviceId = req.headers['x-device-id'] || 'unknown';

        const { data, error } = await supabase
            .from('analytics_events')
            .insert([{
                event: event || 'unknown',
                meta: meta || {},
                timestamp: timestamp || new Date().toISOString(),
                device_id: deviceId
            }]);

        if (error) throw error;
        res.json({ success: true, data });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// POST - Batch analytics events
app.post('/api/analytics/batch', async (req, res) => {
    try {
        const { events } = req.body;
        const deviceId = req.headers['x-device-id'] || 'unknown';

        if (!Array.isArray(events) || events.length === 0) {
            return res.json({ success: true, count: 0 });
        }

        const data = events.map(e => ({
            event: e.event || 'unknown',
            meta: e.meta || {},
            timestamp: e.timestamp || new Date().toISOString(),
            device_id: deviceId
        }));

        const { error } = await supabase
            .from('analytics_events')
            .insert(data);

        if (error) throw error;
        res.json({ success: true, count: events.length });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// GET - All analytics events
app.get('/api/analytics', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('analytics_events')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(100);

        if (error) throw error;
        res.json({ success: true, data });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// HEALTH CHECK
// ============================================

app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ============================================
// START SERVER
// ============================================

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
