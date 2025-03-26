/**
 * Permissions Detector Module
 * Detects browser permissions status and capabilities
 */
class PermissionsDetector {
    constructor() {
        this.sectionId = 'permissions-info';
        this.sectionTitle = 'Browser Permissions';
        this.permissionsData = {};
    }

    /**
     * Run all permissions detection tests
     */
    detect() {
        this._createSection();
        this._detectPermissionsAPI();
        this._checkCommonPermissions();
        
        return this.permissionsData;
    }

    /**
     * Create the permissions info section in the DOM
     */
    _createSection() {
        return window.utils.createInfoSection(this.sectionId, this.sectionTitle);
    }

    /**
     * Detect Permissions API support
     */
    _detectPermissionsAPI() {
        const permissionsSupported = 'permissions' in navigator;
        this.permissionsData.apiSupported = permissionsSupported;
        
        window.utils.addInfo(
            this.sectionId,
            'Permissions API Supported',
            permissionsSupported,
            permissionsSupported ? 'positive-indicator' : 'negative-indicator'
        );
        
        if (!permissionsSupported) {
            window.utils.addInfo(
                this.sectionId,
                'API Status',
                'Your browser does not support the Permissions API'
            );
        }
    }

    /**
     * Check status of common permissions
     */
    async _checkCommonPermissions() {
        if (!('permissions' in navigator)) return;
        
        const permissionsList = [
            { name: 'camera', label: 'Camera' },
            { name: 'microphone', label: 'Microphone' },
            { name: 'geolocation', label: 'Geolocation' },
            { name: 'notifications', label: 'Notifications' },
            { name: 'midi', label: 'MIDI Devices' },
            { name: 'push', label: 'Push Notifications' }
        ];
        
        // Modern browsers might also support these
        if (this._isPermissionQuerySupported('clipboard-read')) {
            permissionsList.push({ name: 'clipboard-read', label: 'Clipboard Read' });
        }
        
        if (this._isPermissionQuerySupported('clipboard-write')) {
            permissionsList.push({ name: 'clipboard-write', label: 'Clipboard Write' });
        }
        
        this.permissionsData.status = {};
        
        // Query each permission
        for (const permission of permissionsList) {
            try {
                const status = await this._queryPermission(permission.name);
                this.permissionsData.status[permission.name] = status;
                
                window.utils.addInfo(
                    this.sectionId,
                    permission.label,
                    this._formatPermissionStatus(status),
                    this._getPermissionStatusClass(status)
                );
            } catch (error) {
                this.permissionsData.status[permission.name] = 'error';
                window.utils.addInfo(
                    this.sectionId,
                    permission.label,
                    'Error querying permission',
                    'warning-indicator'
                );
            }
        }
    }
    
    /**
     * Check if a specific permission can be queried
     */
    _isPermissionQuerySupported(name) {
        try {
            // Just create the query object to see if it throws
            const _ = { name };
            return true;
        } catch (e) {
            return false;
        }
    }
    
    /**
     * Query permission status
     */
    async _queryPermission(name) {
        try {
            const permissionStatus = await navigator.permissions.query({ name });
            return permissionStatus.state;
        } catch (error) {
            throw error;
        }
    }
    
    /**
     * Format permission status for display
     */
    _formatPermissionStatus(status) {
        switch (status) {
            case 'granted':
                return 'Granted';
            case 'denied':
                return 'Denied';
            case 'prompt':
                return 'Ask Every Time';
            default:
                return 'Unknown';
        }
    }
    
    /**
     * Get CSS class for permission status
     */
    _getPermissionStatusClass(status) {
        switch (status) {
            case 'granted':
                return 'positive-indicator';
            case 'denied':
                return 'negative-indicator';
            case 'prompt':
                return 'neutral-indicator';
            default:
                return '';
        }
    }
}

// Export the PermissionsDetector class globally
window.PermissionsDetector = PermissionsDetector; 