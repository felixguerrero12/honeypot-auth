/**
 * Device Detector Module
 * Detects device hardware information for fingerprinting
 */

class DeviceDetector {
    constructor() {
        this.sectionId = 'device-info';
        this.sectionTitle = 'Device Information';
        this.deviceData = {};
    }

    /**
     * Run all device detection tests
     */
    detect() {
        this._createSection();
        this._detectDeviceType();
        this._detectScreen();
        this._detectTouchscreen();
        this._detectMemory();
        this._detectBattery();
        
        return this.deviceData;
    }

    /**
     * Create the device info section in the DOM
     */
    _createSection() {
        if (window.utils && window.utils.log) {
            window.utils.log('Creating device section', 'info');
        }
        return window.utils.createInfoSection(this.sectionId, this.sectionTitle);
    }

    /**
     * Detect device type
     */
    _detectDeviceType() {
        const userAgent = navigator.userAgent || '';
        let deviceType = 'Desktop';
        
        // Simple device type detection based on user agent
        if (/Mobi|Android|iPhone|iPad|iPod|Windows Phone/i.test(userAgent)) {
            deviceType = 'Mobile';
            if (/iPad|Android(?!.*Mobile)/i.test(userAgent)) {
                deviceType = 'Tablet';
            }
        }
        
        this.deviceData.deviceType = deviceType;
        window.utils.addInfo(this.sectionId, 'Device Type', deviceType);
        window.utils.addInfo(this.sectionId, 'User Agent', userAgent);
    }

    /**
     * Detect screen metrics
     */
    _detectScreen() {
        this.deviceData.width = window.screen.width;
        this.deviceData.height = window.screen.height;
        this.deviceData.availWidth = window.screen.availWidth;
        this.deviceData.availHeight = window.screen.availHeight;
        this.deviceData.colorDepth = window.screen.colorDepth;
        this.deviceData.orientation = window.screen.orientation ? window.screen.orientation.type : 'unknown';
        this.deviceData.pixelRatio = window.devicePixelRatio || 1;
        
        window.utils.addInfo(this.sectionId, 'Screen Resolution', `${this.deviceData.width}x${this.deviceData.height}`);
        window.utils.addInfo(this.sectionId, 'Available Screen Size', `${this.deviceData.availWidth}x${this.deviceData.availHeight}`);
        window.utils.addInfo(this.sectionId, 'Color Depth', `${this.deviceData.colorDepth} bits`);
        window.utils.addInfo(this.sectionId, 'Pixel Ratio', this.deviceData.pixelRatio);
        window.utils.addInfo(this.sectionId, 'Screen Orientation', this.deviceData.orientation);
    }

    /**
     * Detect touchscreen capabilities
     */
    _detectTouchscreen() {
        this.deviceData.touchScreen = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        this.deviceData.maxTouchPoints = navigator.maxTouchPoints || 0;
        
        window.utils.addInfo(this.sectionId, 'Touch Screen', this.deviceData.touchScreen);
        window.utils.addInfo(this.sectionId, 'Max Touch Points', this.deviceData.maxTouchPoints);
    }

    /**
     * Detect device memory
     */
    _detectMemory() {
        this.deviceData.deviceMemory = navigator.deviceMemory || 'unknown';
        
        window.utils.addInfo(this.sectionId, 'Device Memory', this.deviceData.deviceMemory + ' GB');
    }

    /**
     * Detect battery status
     */
    _detectBattery() {
        if ('getBattery' in navigator) {
            navigator.getBattery().then(battery => {
                this.deviceData.batteryLevel = battery.level;
                this.deviceData.batteryCharging = battery.charging;
                
                window.utils.addInfo(this.sectionId, 'Battery Level', Math.round(battery.level * 100) + '%');
                window.utils.addInfo(this.sectionId, 'Battery Charging', battery.charging);
            }).catch(err => {
                window.utils.addInfo(this.sectionId, 'Battery Status', 'Not available');
            });
        } else {
            window.utils.addInfo(this.sectionId, 'Battery Status', 'API not supported');
        }
    }
}

// Export the detector
window.DeviceDetector = DeviceDetector; 