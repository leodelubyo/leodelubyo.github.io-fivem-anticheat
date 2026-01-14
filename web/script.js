// FiveM Anti-Cheat Dashboard JavaScript

class AntiCheatDashboard {
    constructor() {
        this.apiBase = window.location.origin + '/api';
        this.currentTab = 'dashboard';
        this.refreshInterval = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadInitialData();
        this.startAutoRefresh();
    }

    setupEventListeners() {
        // Navigation tabs
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.currentTarget.dataset.tab;
                this.switchTab(tab);
            });
        });

        // Modal controls
        document.getElementById('addBanBtn')?.addEventListener('click', () => this.showBanModal());
        document.getElementById('closeModalBtn')?.addEventListener('click', () => this.hideBanModal());
        document.getElementById('cancelModalBtn')?.addEventListener('click', () => this.hideBanModal());
        document.getElementById('banForm')?.addEventListener('submit', (e) => this.handleBanSubmit(e));

        // Search and filter
        document.getElementById('banSearch')?.addEventListener('input', (e) => this.filterBans(e.target.value));
        document.getElementById('banFilter')?.addEventListener('change', (e) => this.filterBansByType(e.target.value));
        document.getElementById('violationSearch')?.addEventListener('input', (e) => this.filterViolations(e.target.value));
        document.getElementById('violationFilter')?.addEventListener('change', (e) => this.filterViolationsByType(e.target.value));
        document.getElementById('playerSearch')?.addEventListener('input', (e) => this.filterPlayers(e.target.value));

        // Action buttons
        document.getElementById('refreshPlayersBtn')?.addEventListener('click', () => this.loadPlayers());
        document.getElementById('clearViolationsBtn')?.addEventListener('click', () => this.clearOldViolations());
        document.getElementById('saveSettingsBtn')?.addEventListener('click', () => this.saveSettings());

        // Close modal on outside click
        document.getElementById('banModal')?.addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                this.hideBanModal();
            }
        });
    }

    switchTab(tabName) {
        // Update navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.tab === tabName) {
                btn.classList.add('active');
            }
        });

        // Update content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(tabName)?.classList.add('active');

        this.currentTab = tabName;

        // Load tab-specific data
        this.loadTabData(tabName);
    }

    loadTabData(tabName) {
        switch (tabName) {
            case 'dashboard':
                this.loadDashboardData();
                break;
            case 'bans':
                this.loadBans();
                break;
            case 'violations':
                this.loadViolations();
                break;
            case 'players':
                this.loadPlayers();
                break;
            case 'settings':
                this.loadSettings();
                break;
        }
    }

    async loadInitialData() {
        await this.loadDashboardData();
        await this.loadBans();
        await this.loadViolations();
        await this.loadPlayers();
    }

    async loadDashboardData() {
        try {
            const [stats, activity] = await Promise.all([
                this.apiCall('/statistics'),
                this.apiCall('/activity')
            ]);

            this.updateDashboardStats(stats);
            this.updateRecentActivity(activity);
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
            this.showError('Failed to load dashboard data');
        }
    }

    updateDashboardStats(stats) {
        document.getElementById('onlinePlayers').textContent = stats.online_players || 0;
        document.getElementById('activeBans').textContent = stats.active_bans || 0;
        document.getElementById('recentViolations').textContent = stats.recent_violations || 0;
        document.getElementById('totalBans').textContent = stats.total_bans || 0;
        document.getElementById('autoBans').textContent = stats.auto_bans || 0;
        document.getElementById('manualBans').textContent = stats.manual_bans || 0;
        document.getElementById('totalViolations').textContent = stats.total_violations || 0;
    }

    updateRecentActivity(activity) {
        const container = document.getElementById('recentActivity');
        if (!activity || activity.length === 0) {
            container.innerHTML = '<div class="no-activity">No recent activity</div>';
            return;
        }

        container.innerHTML = activity.map(item => `
            <div class="activity-item">
                <div>
                    <strong>${this.escapeHtml(item.type)}</strong>
                    <div style="font-size: 0.8rem; color: var(--text-secondary);">
                        ${this.escapeHtml(item.details || '')}
                    </div>
                </div>
                <div class="activity-time">${this.formatTime(item.timestamp)}</div>
            </div>
        `).join('');
    }

    async loadBans() {
        try {
            const response = await this.apiCall('/bans');
            this.renderBansTable(response.bans || []);
        } catch (error) {
            console.error('Failed to load bans:', error);
            this.showError('Failed to load bans');
        }
    }

    renderBansTable(bans) {
        const tbody = document.querySelector('#bansTable tbody');
        if (!bans || bans.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="loading">No bans found</td></tr>';
            return;
        }

        tbody.innerHTML = bans.map(ban => `
            <tr>
                <td>${ban.id}</td>
                <td>${this.escapeHtml(ban.license || 'N/A')}</td>
                <td>${this.escapeHtml(ban.reason)}</td>
                <td>${this.formatDuration(ban.duration)}</td>
                <td><span class="status-badge ${ban.type}">${ban.type}</span></td>
                <td>${this.formatDate(ban.timestamp)}</td>
                <td>
                    <button class="btn btn-sm btn-danger" onclick="dashboard.removeBan(${ban.id})">
                        <i class="fas fa-trash"></i> Remove
                    </button>
                </td>
            </tr>
        `).join('');
    }

    async loadViolations() {
        try {
            const response = await this.apiCall('/violations?limit=50');
            this.renderViolationsTable(response.violations || []);
        } catch (error) {
            console.error('Failed to load violations:', error);
            this.showError('Failed to load violations');
        }
    }

    renderViolationsTable(violations) {
        const tbody = document.querySelector('#violationsTable tbody');
        if (!violations || violations.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="loading">No violations found</td></tr>';
            return;
        }

        tbody.innerHTML = violations.map(violation => `
            <tr>
                <td>${this.escapeHtml(violation.name || 'Unknown')}</td>
                <td><span class="status-badge warning">${this.escapeHtml(violation.type)}</span></td>
                <td>${this.escapeHtml(violation.details || '')}</td>
                <td>${violation.count || 1}</td>
                <td>${this.formatDate(violation.timestamp)}</td>
            </tr>
        `).join('');
    }

    async loadPlayers() {
        try {
            const response = await this.apiCall('/players');
            this.renderPlayersTable(response.players || []);
        } catch (error) {
            console.error('Failed to load players:', error);
            this.showError('Failed to load players');
        }
    }

    renderPlayersTable(players) {
        const tbody = document.querySelector('#playersTable tbody');
        if (!players || players.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="loading">No players online</td></tr>';
            return;
        }

        tbody.innerHTML = players.map(player => `
            <tr>
                <td>${this.escapeHtml(player.name)}</td>
                <td>${this.escapeHtml(player.license || 'N/A')}</td>
                <td>${this.escapeHtml(player.steam || 'N/A')}</td>
                <td>${player.ping || 0}ms</td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="dashboard.quickBan('${player.license}', '${player.name}')">
                        <i class="fas fa-ban"></i> Ban
                    </button>
                </td>
            </tr>
        `).join('');
    }

    showBanModal() {
        document.getElementById('banModal').classList.add('show');
        document.getElementById('modalTitle').textContent = 'Add Ban';
        document.getElementById('banForm').reset();
    }

    hideBanModal() {
        document.getElementById('banModal').classList.remove('show');
    }

    async handleBanSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const banData = {
            license: formData.get('license'),
            steam: formData.get('steam'),
            discord: formData.get('discord'),
            reason: formData.get('reason'),
            duration: parseInt(formData.get('duration')),
            admin: 'Web Dashboard'
        };

        try {
            await this.apiCall('/bans', {
                method: 'POST',
                body: JSON.stringify(banData)
            });
            
            this.showSuccess('Ban added successfully');
            this.hideBanModal();
            this.loadBans();
        } catch (error) {
            console.error('Failed to add ban:', error);
            this.showError('Failed to add ban');
        }
    }

    async removeBan(banId) {
        if (!confirm('Are you sure you want to remove this ban?')) {
            return;
        }

        try {
            await this.apiCall(`/bans/${banId}`, { method: 'DELETE' });
            this.showSuccess('Ban removed successfully');
            this.loadBans();
        } catch (error) {
            console.error('Failed to remove ban:', error);
            this.showError('Failed to remove ban');
        }
    }

    quickBan(license, playerName) {
        document.getElementById('banLicense').value = license;
        document.getElementById('banReason').value = `Quick ban from dashboard - ${playerName}`;
        this.showBanModal();
    }

    filterBans(searchTerm) {
        const rows = document.querySelectorAll('#bansTable tbody tr');
        this.filterTable(rows, searchTerm);
    }

    filterBansByType(type) {
        const rows = document.querySelectorAll('#bansTable tbody tr');
        rows.forEach(row => {
            if (type === 'all') {
                row.style.display = '';
            } else {
                const typeCell = row.querySelector('td:nth-child(5) .status-badge');
                row.style.display = typeCell && typeCell.textContent.toLowerCase() === type ? '' : 'none';
            }
        });
    }

    filterViolations(searchTerm) {
        const rows = document.querySelectorAll('#violationsTable tbody tr');
        this.filterTable(rows, searchTerm);
    }

    filterViolationsByType(type) {
        const rows = document.querySelectorAll('#violationsTable tbody tr');
        rows.forEach(row => {
            if (type === 'all') {
                row.style.display = '';
            } else {
                const typeCell = row.querySelector('td:nth-child(2) .status-badge');
                row.style.display = typeCell && typeCell.textContent.toLowerCase() === type ? '' : 'none';
            }
        });
    }

    filterPlayers(searchTerm) {
        const rows = document.querySelectorAll('#playersTable tbody tr');
        this.filterTable(rows, searchTerm);
    }

    filterTable(rows, searchTerm) {
        const term = searchTerm.toLowerCase();
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(term) ? '' : 'none';
        });
    }

    async clearOldViolations() {
        if (!confirm('Are you sure you want to clear old violations (older than 30 days)?')) {
            return;
        }

        try {
            await this.apiCall('/violations/clear', { method: 'DELETE' });
            this.showSuccess('Old violations cleared successfully');
            this.loadViolations();
        } catch (error) {
            console.error('Failed to clear violations:', error);
            this.showError('Failed to clear violations');
        }
    }

    loadSettings() {
        // Load settings from API or localStorage
        const settings = {
            detectionEnabled: true,
            autoBanEnabled: true,
            globalBanEnabled: true,
            maxViolations: 3,
            banDuration: 24
        };

        document.getElementById('detectionEnabled').checked = settings.detectionEnabled;
        document.getElementById('autoBanEnabled').checked = settings.autoBanEnabled;
        document.getElementById('globalBanEnabled').checked = settings.globalBanEnabled;
        document.getElementById('maxViolations').value = settings.maxViolations;
        document.getElementById('banDuration').value = settings.banDuration;
    }

    async saveSettings() {
        const settings = {
            detectionEnabled: document.getElementById('detectionEnabled').checked,
            autoBanEnabled: document.getElementById('autoBanEnabled').checked,
            globalBanEnabled: document.getElementById('globalBanEnabled').checked,
            maxViolations: parseInt(document.getElementById('maxViolations').value),
            banDuration: parseInt(document.getElementById('banDuration').value)
        };

        try {
            await this.apiCall('/settings', {
                method: 'PUT',
                body: JSON.stringify(settings)
            });
            this.showSuccess('Settings saved successfully');
        } catch (error) {
            console.error('Failed to save settings:', error);
            this.showError('Failed to save settings');
        }
    }

    startAutoRefresh() {
        // Refresh data every 30 seconds
        this.refreshInterval = setInterval(() => {
            if (this.currentTab === 'dashboard') {
                this.loadDashboardData();
            } else if (this.currentTab === 'players') {
                this.loadPlayers();
            }
        }, 30000);
    }

    stopAutoRefresh() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
    }

    async apiCall(endpoint, options = {}) {
        const url = `${this.apiBase}${endpoint}`;
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.getAuthToken()}`
            }
        };

        const response = await fetch(url, { ...defaultOptions, ...options });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    }

    getAuthToken() {
        // Get auth token from localStorage or other storage
        return localStorage.getItem('anticheat_token') || 'default-token';
    }

    formatDuration(hours) {
        if (hours === 8760) return 'Permanent';
        if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''}`;
        if (hours < 168) return `${Math.floor(hours / 24)} day${Math.floor(hours / 24) > 1 ? 's' : ''}`;
        if (hours < 720) return `${Math.floor(hours / 168)} week${Math.floor(hours / 168) > 1 ? 's' : ''}`;
        return `${Math.floor(hours / 720)} month${Math.floor(hours / 720) > 1 ? 's' : ''}`;
    }

    formatDate(timestamp) {
        return new Date(timestamp * 1000).toLocaleString();
    }

    formatTime(timestamp) {
        const date = new Date(timestamp * 1000);
        const now = new Date();
        const diff = now - date;

        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)} min ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)} hours ago`;
        return date.toLocaleDateString();
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            animation: slideIn 0.3s ease;
            background: ${type === 'success' ? 'var(--success-color)' : 'var(--danger-color)'};
        `;

        document.body.appendChild(notification);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.dashboard = new AntiCheatDashboard();
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (window.dashboard) {
        window.dashboard.stopAutoRefresh();
    }
});
