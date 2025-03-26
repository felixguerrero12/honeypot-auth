/**
 * Browser Information Detector
 * Collects and analyzes browser-specific information
 */

class BrowserDetector {
    constructor() {
        this.sectionId = 'browser-info';
        this.sectionTitle = 'Browser Information';
        this.browserData = {};
    }

    /**
     * Run all browser detection tests
     */
    detect() {
        this._createSection();
        this._detectBrowserInfo();
        this._detectLanguages();
        this._detectDNT();
        this._detectSessionStorage();
        this._detectCookies();
        
        return this.browserData;
    }

    /**
     * Create the browser info section in the DOM
     */
    _createSection() {
        return window.utils.createInfoSection(this.sectionId, this.sectionTitle);
    }

    /**
     * Detect basic browser information
     */
    _detectBrowserInfo() {
        const ua = navigator.userAgent;
        this.browserData.userAgent = ua;
        window.utils.addInfo(this.sectionId, 'User Agent', ua);
        
        const browserInfo = this._parseUserAgent(ua);
        this.browserData.browserName = browserInfo.browser;
        this.browserData.browserVersion = browserInfo.version;
        
        window.utils.addInfo(this.sectionId, 'Browser', `${browserInfo.browser} ${browserInfo.version}`);
        window.utils.addInfo(this.sectionId, 'Browser Vendor', navigator.vendor || 'Not available');
        window.utils.addInfo(this.sectionId, 'Browser Engine', browserInfo.engine || 'Unknown');
    }

    /**
     * Parse user agent string to extract browser details
     */
    _parseUserAgent(ua) {
        let browser = 'Unknown';
        let version = '';
        let engine = 'Unknown';
        
        // Detect browser and version
        if (/firefox/i.test(ua)) {
            browser = 'Firefox';
            version = ua.match(/Firefox\/([\d.]+)/)?.[1] || '';
            engine = 'Gecko';
        } else if (/chrome/i.test(ua) && !/edg/i.test(ua) && !/opr/i.test(ua)) {
            browser = 'Chrome';
            version = ua.match(/Chrome\/([\d.]+)/)?.[1] || '';
            engine = 'Blink';
        } else if (/safari/i.test(ua) && !/chrome/i.test(ua)) {
            browser = 'Safari';
            version = ua.match(/Version\/([\d.]+)/)?.[1] || '';
            engine = 'WebKit';
        } else if (/edg/i.test(ua)) {
            browser = 'Edge';
            version = ua.match(/Edg\/([\d.]+)/)?.[1] || '';
            engine = 'Blink';
        } else if (/opr/i.test(ua) || /opera/i.test(ua)) {
            browser = 'Opera';
            version = (ua.match(/OPR\/([\d.]+)/) || ua.match(/Opera\/([\d.]+)/))?.[1] || '';
            engine = 'Blink';
        } else if (/trident/i.test(ua) || /msie/i.test(ua)) {
            browser = 'Internet Explorer';
            version = (ua.match(/rv:([\d.]+)/) || ua.match(/MSIE ([\d.]+)/))?.[1] || '';
            engine = 'Trident';
        }
        
        return { browser, version, engine };
    }

    /**
     * Detect language settings
     */
    _detectLanguages() {
        const language = navigator.language || navigator.userLanguage || 'Not available';
        window.utils.addInfo(this.sectionId, 'Language', language);
        this.browserData.language = language;
        
        if (navigator.languages) {
            window.utils.addInfo(this.sectionId, 'All Languages', navigator.languages.join(', '));
            this.browserData.languages = navigator.languages;
        }
    }

    /**
     * Detect Do Not Track setting
     */
    _detectDNT() {
        const dnt = navigator.doNotTrack || window.doNotTrack || navigator.msDoNotTrack || 'Not available';
        const dntEnabled = dnt === '1' || dnt === 'yes';
        
        window.utils.addInfo(this.sectionId, 'Do Not Track', dntEnabled ? 'Enabled' : 'Disabled');
        this.browserData.doNotTrack = dntEnabled;
    }

    /**
     * Detect session storage availability
     */
    _detectSessionStorage() {
        let sessionStorageAvailable = false;
        
        try {
            sessionStorageAvailable = !!window.sessionStorage;
            if (sessionStorageAvailable) {
                // Test if we can actually use it
                window.sessionStorage.setItem('test', 'test');
                window.sessionStorage.removeItem('test');
            }
        } catch (e) {
            sessionStorageAvailable = false;
        }
        
        window.utils.addInfo(this.sectionId, 'Session Storage', sessionStorageAvailable ? 'Available' : 'Not available');
        this.browserData.sessionStorage = sessionStorageAvailable;
    }

    /**
     * Detect cookie availability
     */
    _detectCookies() {
        const cookiesEnabled = navigator.cookieEnabled;
        window.utils.addInfo(this.sectionId, 'Cookies Enabled', cookiesEnabled ? 'Yes' : 'No');
        this.browserData.cookiesEnabled = cookiesEnabled;
    }
}

// Export the detector
window.BrowserDetector = BrowserDetector; 