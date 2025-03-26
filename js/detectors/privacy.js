/**
 * Privacy Detector Module
 * Detects privacy-related settings and browser features
 */

class PrivacyDetector {
    constructor() {
        this.sectionId = 'privacy-info';
        this.sectionTitle = 'Privacy Information';
        this.privacyData = {};
    }

    /**
     * Run all privacy detection tests
     */
    detect() {
        this._createSection();
        this._detectDoNotTrack();
        this._detectCookies();
        this._detectLocalStorage();
        this._detectIndexedDB();
        this._detectPrivateMode();
        this._detectAddBlocker();
        
        return this.privacyData;
    }

    /**
     * Create the privacy info section in the DOM
     */
    _createSection() {
        if (window.utils && window.utils.log) {
            window.utils.log('Creating privacy section', 'info');
        }
        return window.utils.createInfoSection(this.sectionId, this.sectionTitle);
    }

    /**
     * Detect Do Not Track setting
     */
    _detectDoNotTrack() {
        const dnt = navigator.doNotTrack || window.doNotTrack || navigator.msDoNotTrack;
        
        let dntEnabled = false;
        if (dnt) {
            dntEnabled = dnt === '1' || dnt === 'yes' || dnt === 'on';
        }
        
        this.privacyData.doNotTrack = dntEnabled;
        window.utils.addInfo(this.sectionId, 'Do Not Track Enabled', dntEnabled);
    }

    /**
     * Detect cookie availability
     */
    _detectCookies() {
        let cookiesEnabled = navigator.cookieEnabled;
        
        // Double-check with a test cookie if the property exists
        if (cookiesEnabled && document.cookie !== undefined) {
            try {
                // Try to set a test cookie
                document.cookie = "testcookie=1";
                cookiesEnabled = document.cookie.indexOf("testcookie") !== -1;
                
                // Clean up the test cookie
                document.cookie = "testcookie=1; expires=Thu, 01 Jan 1970 00:00:00 GMT";
            } catch (e) {
                cookiesEnabled = false;
            }
        }
        
        this.privacyData.cookiesEnabled = cookiesEnabled;
        window.utils.addInfo(this.sectionId, 'Cookies Enabled', cookiesEnabled);
    }

    /**
     * Detect localStorage availability
     */
    _detectLocalStorage() {
        let localStorageEnabled = false;
        
        try {
            if (window.localStorage) {
                // Test localStorage by setting and getting a test value
                localStorage.setItem('test', 'test');
                localStorageEnabled = localStorage.getItem('test') === 'test';
                localStorage.removeItem('test');
            }
        } catch (e) {
            // Exception thrown if storage is disabled or quota exceeded
            localStorageEnabled = false;
        }
        
        this.privacyData.localStorageEnabled = localStorageEnabled;
        window.utils.addInfo(this.sectionId, 'Local Storage Enabled', localStorageEnabled);
    }

    /**
     * Detect IndexedDB availability
     */
    _detectIndexedDB() {
        const indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
        
        this.privacyData.indexedDBEnabled = !!indexedDB;
        window.utils.addInfo(this.sectionId, 'IndexedDB Enabled', !!indexedDB);
    }

    /**
     * Attempt to detect private browsing mode
     * Note: Modern browsers make this intentionally difficult
     */
    _detectPrivateMode() {
        window.utils.addInfo(this.sectionId, 'Private Browsing Detection', 'Modern browsers block reliable private mode detection');
        window.utils.addInfo(this.sectionId, 'Privacy Note', 'Browsers intentionally limit fingerprinting in private modes');
    }

    /**
     * Basic ad blocker detection
     */
    _detectAddBlocker() {
        // Create a bait element that ad blockers might hide
        const bait = document.createElement('div');
        bait.innerHTML = '&nbsp;';
        bait.className = 'adsbox pub_300x250 pub_300x250m pub_728x90 text-ad textAd text_ad';
        bait.style.cssText = 'position: absolute; left: -10000px; top: -10000px; width: 1px; height: 1px;';
        
        document.body.appendChild(bait);
        
        // Set a small timeout to allow ad blockers to act
        setTimeout(() => {
            let adBlockerDetected = false;
            
            if (bait.offsetHeight === 0 || 
                bait.offsetWidth === 0 || 
                bait.clientHeight === 0 || 
                bait.clientWidth === 0) {
                adBlockerDetected = true;
            }
            
            const computed = window.getComputedStyle(bait);
            if (computed && (
                computed.getPropertyValue('display') === 'none' || 
                computed.getPropertyValue('visibility') === 'hidden')) {
                adBlockerDetected = true;
            }
            
            // Clean up the bait
            if (bait.parentNode) {
                bait.parentNode.removeChild(bait);
            }
            
            this.privacyData.adBlockerDetected = adBlockerDetected;
            window.utils.addInfo(this.sectionId, 'Ad Blocker Detected', adBlockerDetected);
        }, 100);
    }
}

// Export the detector
window.PrivacyDetector = PrivacyDetector; 