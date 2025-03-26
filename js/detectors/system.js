/**
 * System Information Detector
 * Collects and analyzes system-specific information including OS, CPU, and memory
 */

class SystemDetector {
    constructor() {
        this.sectionId = 'system-info';
        this.sectionTitle = 'System Information';
        this.systemData = {};
    }

    /**
     * Run all system detection tests
     */
    detect() {
        this._createSection();
        this._detectOS();
        this._detectCPU();
        this._detectMemory();
        this._detectTimezone();
        
        return this.systemData;
    }

    /**
     * Create the system info section in the DOM
     */
    _createSection() {
        return window.utils.createInfoSection(this.sectionId, this.sectionTitle);
    }

    /**
     * Detect operating system information
     */
    _detectOS() {
        const ua = navigator.userAgent;
        let os = 'Unknown';
        let osVersion = '';
        
        if (/Windows/.test(ua)) {
            os = 'Windows';
            if (/Windows NT 10.0/.test(ua)) osVersion = '10';
            else if (/Windows NT 6.3/.test(ua)) osVersion = '8.1';
            else if (/Windows NT 6.2/.test(ua)) osVersion = '8';
            else if (/Windows NT 6.1/.test(ua)) osVersion = '7';
            else if (/Windows NT 6.0/.test(ua)) osVersion = 'Vista';
            else if (/Windows NT 5.1/.test(ua)) osVersion = 'XP';
            else osVersion = 'Unknown';
        } else if (/Macintosh/.test(ua) && /Mac OS X/.test(ua)) {
            os = 'macOS';
            osVersion = ua.match(/Mac OS X ([0-9._]+)/);
            if (osVersion) {
                osVersion = osVersion[1].replace(/_/g, '.');
            } else {
                osVersion = 'Unknown';
            }
        } else if (/Linux/.test(ua)) {
            os = 'Linux';
        } else if (/Android/.test(ua)) {
            os = 'Android';
            osVersion = ua.match(/Android ([0-9.]+)/);
            osVersion = osVersion ? osVersion[1] : 'Unknown';
        } else if (/iPhone|iPad|iPod/.test(ua)) {
            os = 'iOS';
            osVersion = ua.match(/OS ([0-9_]+)/);
            osVersion = osVersion ? osVersion[1].replace(/_/g, '.') : 'Unknown';
        }
        
        this.systemData.os = os;
        this.systemData.osVersion = osVersion;
        
        window.utils.addInfo(this.sectionId, 'Operating System', os + (osVersion ? ' ' + osVersion : ''));
        window.utils.addInfo(this.sectionId, 'Platform', navigator.platform || 'Not available');
    }

    /**
     * Detect CPU information
     */
    _detectCPU() {
        let cpuCores = navigator.hardwareConcurrency || 'Not available';
        this.systemData.cpuCores = cpuCores;
        window.utils.addInfo(this.sectionId, 'CPU Cores', cpuCores);
    }

    /**
     * Detect memory information
     */
    _detectMemory() {
        let memoryInfo = 'Not available';
        
        if (navigator.deviceMemory) {
            memoryInfo = navigator.deviceMemory + ' GB';
            this.systemData.deviceMemory = navigator.deviceMemory;
        }
        
        window.utils.addInfo(this.sectionId, 'Device Memory', memoryInfo);
    }

    /**
     * Detect timezone information
     */
    _detectTimezone() {
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Not available';
        const offset = new Date().getTimezoneOffset();
        const offsetHours = Math.abs(Math.floor(offset / 60));
        const offsetMinutes = Math.abs(offset % 60);
        const offsetSign = offset < 0 ? '+' : '-';
        const offsetString = `${offsetSign}${String(offsetHours).padStart(2, '0')}:${String(offsetMinutes).padStart(2, '0')}`;
        
        this.systemData.timezone = timezone;
        this.systemData.timezoneOffset = offsetString;
        
        window.utils.addInfo(this.sectionId, 'Timezone', timezone);
        window.utils.addInfo(this.sectionId, 'Timezone Offset', offsetString);
    }
}

// Export the detector
window.SystemDetector = SystemDetector; 