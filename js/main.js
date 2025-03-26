/**
 * Main Application
 * Initializes and coordinates all fingerprinting detector modules
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check if utils is already defined by the utils.js file
    if (!window.utils) {
        // Initialize utils library as global if not already initialized
        window.utils = {
            log: log,
            createInfoSection: createInfoSection,
            addInfo: addInfo,
            generateFingerprint: generateFingerprint,
            safeExecute: safeExecute,
            findAppropriateTab: findAppropriateTab
        };
    }
    
    // Initialize tabs if they exist
    initTabs();
    
    // Initialize debug toggle
    initDebugToggle();
    
    // Initialize all detectors and gather data
    initializeDetectors();
});

/**
 * Initialize debug toggle button
 */
function initDebugToggle() {
    const debugToggle = document.getElementById('debug-toggle');
    const debugConsole = document.getElementById('debug-console');
    
    if (debugToggle && debugConsole) {
        debugToggle.addEventListener('click', function() {
            debugConsole.classList.toggle('visible');
            debugToggle.textContent = debugConsole.classList.contains('visible') ? 'Hide Debug Console' : 'Show Debug Console';
        });
    }
}

/**
 * Initialize all fingerprinting detector modules
 */
function initializeDetectors() {
    const fingerprintData = {};
    
    // Browser detector
    try {
        const browserDetector = new BrowserDetector();
        fingerprintData.browser = browserDetector.detect();
    } catch (e) {
        utils.log('Error initializing browser detector: ' + e.message, 'error');
    }
    
    // System detector
    try {
        const systemDetector = new SystemDetector();
        fingerprintData.system = systemDetector.detect();
    } catch (e) {
        utils.log('Error initializing system detector: ' + e.message, 'error');
    }
    
    // Graphics detector
    try {
        const graphicsDetector = new GraphicsDetector();
        fingerprintData.graphics = graphicsDetector.detect();
    } catch (e) {
        utils.log('Error initializing graphics detector: ' + e.message, 'error');
    }
    
    // Network detector
    try {
        if (typeof NetworkDetector !== 'undefined') {
            const networkDetector = new NetworkDetector();
            fingerprintData.network = networkDetector.detect();
        } else {
            utils.log('Network detector not loaded', 'warn');
            createPlaceholderSection('network-info', 'Network Information', 
                'Network detection module is not currently loaded.');
        }
    } catch (e) {
        utils.log('Error initializing network detector: ' + e.message, 'error');
    }
    
    // Device detector
    try {
        if (typeof DeviceDetector !== 'undefined') {
            const deviceDetector = new DeviceDetector();
            fingerprintData.device = deviceDetector.detect();
        } else {
            utils.log('Device detector not loaded', 'warn');
            createPlaceholderSection('device-info', 'Device Information', 
                'Device detection module is not currently loaded.');
        }
    } catch (e) {
        utils.log('Error initializing device detector: ' + e.message, 'error');
    }
    
    // Privacy detector
    try {
        if (typeof PrivacyDetector !== 'undefined') {
            const privacyDetector = new PrivacyDetector();
            fingerprintData.privacy = privacyDetector.detect();
        } else {
            utils.log('Privacy detector not loaded', 'warn');
            createPlaceholderSection('privacy-info', 'Privacy Information', 
                'Privacy detection module is not currently loaded.');
        }
    } catch (e) {
        utils.log('Error initializing privacy detector: ' + e.message, 'error');
    }
    
    // Permissions detector
    try {
        if (typeof PermissionsDetector !== 'undefined') {
            const permissionsDetector = new PermissionsDetector();
            fingerprintData.permissions = permissionsDetector.detect();
        } else {
            utils.log('Permissions detector not loaded', 'warn');
            createPlaceholderSection('permissions-info', 'Browser Permissions', 
                'Permissions detection module is not currently loaded.');
        }
    } catch (e) {
        utils.log('Error initializing permissions detector: ' + e.message, 'error');
    }
    
    // Mouse interaction detector
    try {
        if (typeof MouseInteractionDetector !== 'undefined') {
            const mouseInteractionDetector = new MouseInteractionDetector();
            fingerprintData.mouseInteraction = mouseInteractionDetector.detect();
        } else {
            utils.log('Mouse interaction detector not loaded', 'warn');
        }
    } catch (e) {
        utils.log('Error initializing mouse interaction detector: ' + e.message, 'error');
    }
    
    // Bot detection
    try {
        if (typeof BotDetector !== 'undefined') {
            const botDetector = new BotDetector();
            fingerprintData.botDetection = botDetector.detect();
        } else {
            utils.log('Bot detection module not loaded', 'warn');
            createPlaceholderSection('bot-detection', 'Bot Detection', 
                'Bot detection module is not currently loaded.');
        }
    } catch (e) {
        utils.log('Error loading bot detection module: ' + e.message, 'error');
    }
    
    // Canvas fingerprinting
    try {
        if (typeof CanvasFingerprintDetector !== 'undefined') {
            const canvasFingerprintDetector = new CanvasFingerprintDetector();
            fingerprintData.canvasFingerprint = canvasFingerprintDetector.detect();
        } else {
            utils.log('Canvas fingerprint detector not loaded', 'warn');
            createPlaceholderSection('canvas-fingerprint-info', 'Canvas Fingerprint', 
                'Canvas fingerprinting module is not currently loaded.');
        }
    } catch (e) {
        utils.log('Error initializing canvas fingerprint detector: ' + e.message, 'error');
    }
    
    // API Fingerprint detector
    try {
        if (typeof APIFingerprintDetector !== 'undefined') {
            window.utils.log('Initializing API Fingerprint Detector', 'info');
            window.apiFingerprintDetector = new APIFingerprintDetector();
            window.utils.log('Running API Fingerprint detection', 'info');
            fingerprintData.apiFingerprint = window.apiFingerprintDetector.detect();
            window.utils.log('API Fingerprint detection completed', 'info');
        } else {
            window.utils.log('API fingerprint detector not loaded', 'warn');
            createPlaceholderSection('api-fingerprint-info', 'API Fingerprint', 
                'API fingerprinting module is not currently loaded.');
        }
    } catch (e) {
        window.utils.log('Error initializing API fingerprint detector: ' + e.message, 'error');
    }
    
    // Remote Desktop detector
    try {
        if (typeof RemoteDesktopDetector !== 'undefined') {
            window.utils.log('Initializing Remote Desktop Detector', 'info');
            window.remoteDesktopDetector = new RemoteDesktopDetector();
            // Update the section ID to match the tab ID
            window.remoteDesktopDetector.sectionId = 'remote-desktop-info';
            window.utils.log('Running Remote Desktop detection', 'info');
            fingerprintData.remoteDesktop = window.remoteDesktopDetector.detect();
            window.utils.log('Remote Desktop detection completed', 'info');
        } else {
            window.utils.log('Remote Desktop detector not loaded', 'warn');
            createPlaceholderSection('remote-desktop-info', 'Remote Desktop Detection', 
                'Remote Desktop detection module is not currently loaded.');
        }
    } catch (e) {
        window.utils.log('Error initializing Remote Desktop detector: ' + e.message, 'error');
    }
    
    // Create basic info section with overall fingerprint
    try {
        // Generate an overall fingerprint
        const fingerprintHash = utils.generateFingerprint(fingerprintData);
        // Create the basic info section with the overall fingerprint and data
        createDetailedBasicInfo(fingerprintHash, fingerprintData);
        
        // Create the summary tab
        createSummaryTab(fingerprintData, fingerprintHash);
    } catch (e) {
        utils.log('Error generating overall fingerprint: ' + e.message, 'error');
    }
    
    // Set up export functionality
    document.getElementById('export-btn').addEventListener('click', function() {
        const dataStr = JSON.stringify(fingerprintData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = 'fingerprint-data.json';
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    });
}

/**
 * Creates a more comprehensive basic info section
 * @param {string} fingerprintHash - The generated fingerprint hash
 * @param {object} fingerprintData - All collected fingerprint data
 */
function createDetailedBasicInfo(fingerprintHash, fingerprintData) {
    const basicTab = document.getElementById('tab-basic');
    if (!basicTab) return;
    
    // Only create if it doesn't exist yet
    if (!document.getElementById('basic-info-section')) {
        const basicSection = document.createElement('div');
        basicSection.className = 'info-section';
        basicSection.id = 'basic-info-section';
        
        const heading = document.createElement('h2');
        heading.textContent = 'Fingerprint Summary';
        basicSection.appendChild(heading);
        
        const summary = document.createElement('div');
        summary.className = 'fingerprint-summary';
        summary.innerHTML = `
            <p>The browser fingerprint hash is a unique identifier created from all collected information.</p>
            <div class="fingerprint-hash">${fingerprintHash}</div>
            <p>Your fingerprint includes ${Object.keys(fingerprintData).length} detection modules:</p>
            <ul>
                ${Object.keys(fingerprintData).map(key => `<li>${key}</li>`).join('')}
            </ul>
        `;
        basicSection.appendChild(summary);
        
        // Add to Basic tab
        basicTab.appendChild(basicSection);
    }
}

/**
 * Creates a placeholder section for missing detectors
 * @param {string} id - Section ID
 * @param {string} title - Section title
 * @param {string} message - Message to display
 */
function createPlaceholderSection(id, title, message) {
    const section = utils.createInfoSection(id, title);
    utils.addInfo(id, 'Status', message, 'warning-indicator');
    utils.addInfo(id, 'Implementation Status', 'Not implemented yet', 'warning-indicator');
    utils.addInfo(id, 'Documentation', 'See the README for information on implementing this detector.');
    
    // Add a more visible message to explain missing functionality
    const tab = findAppropriateTab(id);
    if (tab && tab.querySelectorAll('.info-section').length === 1) {
        const placeholderMsg = document.createElement('div');
        placeholderMsg.className = 'placeholder-message';
        placeholderMsg.innerHTML = `
            <h3>This module is not yet implemented</h3>
            <p>The ${title} detector has been planned but not yet implemented. 
            You can implement this module by creating a new detector file in the js/detectors directory.</p>
        `;
        tab.appendChild(placeholderMsg);
    }
}

/**
 * Logger function for debugging
 * @param {string} message - Message to log
 * @param {string} level - Log level (info, warn, error)
 */
function log(message, level = 'info') {
    // Global debug flag
    const DEBUG = true;
    
    if (!DEBUG) return;
    
    const debugConsole = document.getElementById('debug-console');
    if (!debugConsole) return;
    
    const entry = document.createElement('div');
    entry.className = `debug-entry debug-${level}`;
    
    const timestamp = new Date().toLocaleTimeString();
    entry.textContent = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    
    debugConsole.appendChild(entry);
    debugConsole.scrollTop = debugConsole.scrollHeight;
    
    // Also log to browser console in development
    if (level === 'error') {
        console.error(message);
    } else if (level === 'warn') {
        console.warn(message);
    } else {
        console.log(message);
    }
}

/**
 * Creates an information section in the DOM if it doesn't exist
 * @param {string} id - ID for the section
 * @param {string} title - Title for the section
 * @returns {HTMLElement} - The section container element
 */
function createInfoSection(id, title) {
    const existingSection = document.getElementById(id);
    if (existingSection) return existingSection;
    
    const section = document.createElement('div');
    section.className = 'info-section';
    section.id = id;
    
    const heading = document.createElement('h2');
    heading.textContent = title;
    section.appendChild(heading);
    
    const container = document.createElement('ul');
    container.className = 'property-list';
    section.appendChild(container);
    
    // Find the appropriate tab to append this section
    const tabContent = findAppropriateTab(id);
    if (tabContent) {
        tabContent.appendChild(section);
    } else {
        // Fallback to appending to body if no appropriate tab is found
        document.body.appendChild(section);
    }
    
    return section;
}

/**
 * Find the appropriate tab for a section based on its ID
 * @param {string} sectionId - The section ID
 * @returns {HTMLElement} - The tab content element
 */
function findAppropriateTab(sectionId) {
    // Map section IDs to tab content elements
    const tabMap = {
        'browser-info': document.getElementById('tab-browser'),
        'system-info': document.getElementById('tab-system'),
        'webgl-info': document.getElementById('tab-graphics'),
        'graphics-info': document.getElementById('tab-graphics'),
        'hardware-accel': document.getElementById('tab-graphics'),
        'color-depth-info': document.getElementById('tab-graphics'),
        'font-info': document.getElementById('tab-browser'),
        'network-info': document.getElementById('tab-network'),
        'device-info': document.getElementById('tab-device'),
        'memory-storage-info': document.getElementById('tab-system'),
        'cpu-info': document.getElementById('tab-system'),
        'language-info': document.getElementById('tab-system'),
        'timezone-info': document.getElementById('tab-system'),
        'privacy-info': document.getElementById('tab-privacy'),
        'permissions-info': document.getElementById('tab-privacy'),
        'bot-detection': document.getElementById('tab-bot'),
        'interaction-info': document.getElementById('tab-interaction'),
        'fingerprint-result': document.getElementById('tab-basic'),
        'remote-desktop-info': document.getElementById('tab-remote-desktop')
    };
    
    return tabMap[sectionId] || document.getElementById('tab-basic');
}

/**
 * Add information to a section
 * @param {string} sectionId - ID of the section to add info to
 * @param {string} name - Name/label of the property
 * @param {string|number|boolean} value - Value of the property
 * @param {string} className - Optional CSS class to add to the item
 */
function addInfo(sectionId, name, value, className = '') {
    const section = document.getElementById(sectionId) || createInfoSection(sectionId, sectionId.replace(/-/g, ' ').replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase()));
    const container = section.querySelector('.property-list') || section;
    
    // Check if this property already exists
    const existingItems = container.querySelectorAll('li');
    for (let i = 0; i < existingItems.length; i++) {
        const item = existingItems[i];
        const itemName = item.querySelector('.property-name')?.textContent;
        
        if (itemName === name) {
            // Update the existing item value
            const valueSpan = item.querySelector('.property-value');
            if (valueSpan) {
                // Clear existing content
                while (valueSpan.firstChild) {
                    valueSpan.removeChild(valueSpan.firstChild);
                }
                
                // Update with new value
                if (value === undefined || value === null) {
                    valueSpan.textContent = 'Not available';
                    valueSpan.classList.add('negative-indicator');
                } else if (typeof value === 'boolean') {
                    valueSpan.textContent = value ? 'Yes' : 'No';
                    valueSpan.classList.add(value ? 'positive-indicator' : 'negative-indicator');
                } else if (value instanceof HTMLElement) {
                    valueSpan.appendChild(value);
                } else {
                    valueSpan.textContent = value.toString();
                }
                
                return item;
            }
        }
    }
    
    // If not found, create a new item
    const item = document.createElement('li');
    if (className) item.className = className;
    
    const nameSpan = document.createElement('span');
    nameSpan.className = 'property-name';
    nameSpan.textContent = name;
    
    const valueSpan = document.createElement('span');
    valueSpan.className = 'property-value';
    
    // Handle different value types
    if (value === undefined || value === null) {
        valueSpan.textContent = 'Not available';
        valueSpan.classList.add('negative-indicator');
    } else if (typeof value === 'boolean') {
        valueSpan.textContent = value ? 'Yes' : 'No';
        valueSpan.classList.add(value ? 'positive-indicator' : 'negative-indicator');
    } else if (value instanceof HTMLElement) {
        valueSpan.appendChild(value);
    } else {
        valueSpan.textContent = value.toString();
    }
    
    item.appendChild(nameSpan);
    item.appendChild(valueSpan);
    container.appendChild(item);
    
    return item;
}

/**
 * Generate a fingerprint hash from an object
 * @param {Object} data - Object containing fingerprint properties
 * @returns {string} - Fingerprint hash
 */
function generateFingerprint(data) {
    try {
        // Convert object to a stable string
        const jsonString = JSON.stringify(data, Object.keys(data).sort());
        
        // Simple hash function
        let hash = 0;
        for (let i = 0; i < jsonString.length; i++) {
            const char = jsonString.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        
        // Convert to hex string and ensure positive
        return Math.abs(hash).toString(16).padStart(8, '0');
    } catch (e) {
        log('Error generating fingerprint: ' + e.message, 'error');
        return 'error';
    }
}

/**
 * Initialize the tab functionality
 */
function initTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    
    if (!tabButtons.length) return;
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to current button and content
            button.classList.add('active');
            const tabId = button.getAttribute('data-tab');
            document.getElementById(tabId)?.classList.add('active');
        });
    });
    
    // Set the first tab as active by default
    if (tabButtons.length > 0) {
        tabButtons[0].click();
    }
}

/**
 * Safely executes a function and handles errors
 * @param {Function} fn - Function to execute
 * @param {*} defaultValue - Default value to return on error
 * @returns {*} - Result of function or default value on error
 */
function safeExecute(fn, defaultValue = null) {
    try {
        return fn();
    } catch (e) {
        log(`Error executing function: ${e.message}`, 'error');
        return defaultValue;
    }
}

/**
 * Creates the summary tab with key findings from all detectors
 * @param {object} fingerprintData - All collected fingerprint data
 * @param {string} fingerprintHash - The generated fingerprint hash
 */
function createSummaryTab(fingerprintData, fingerprintHash) {
    try {
        const summaryTab = document.getElementById('tab-summary');
        if (!summaryTab) return;
        
        // Create summary container
        const summaryContainer = document.createElement('div');
        summaryContainer.className = 'detection-summary';
        
        const heading = document.createElement('h2');
        heading.textContent = 'Detection Summary';
        summaryContainer.appendChild(heading);
        
        // Add key findings
        const findings = [];
        
        // Bot detection summary
        if (fingerprintData.botDetection) {
            const botScore = fingerprintData.botDetection.overallScore || 0;
            let indicatorClass = 'indicator-positive';
            let status = 'Likely human';
            
            if (botScore > 0.7) {
                indicatorClass = 'indicator-negative';
                status = 'Likely bot';
            } else if (botScore > 0.3) {
                indicatorClass = 'indicator-warning';
                status = 'Suspicious behavior';
            }
            
            findings.push({
                label: 'Bot Detection',
                value: status,
                indicatorClass: indicatorClass,
                priority: 1
            });
        }
        
        // Remote Desktop Detection
        if (fingerprintData.remoteDesktop) {
            const detected = fingerprintData.remoteDesktop.detected;
            const type = fingerprintData.remoteDesktop.type || 'unknown';
            
            if (detected) {
                let rdpLabel = 'Remote Access Detected';
                if (type !== 'none' && type !== 'other') {
                    rdpLabel = `${type.toUpperCase()} Connection Detected`;
                }
                
                findings.push({
                    label: 'Remote Access',
                    value: rdpLabel,
                    indicatorClass: 'indicator-negative',
                    priority: 2
                });
            }
        }
        
        // Browser Privacy
        if (fingerprintData.privacy) {
            if (fingerprintData.privacy.privateMode) {
                findings.push({
                    label: 'Private Browsing',
                    value: 'Active',
                    indicatorClass: 'indicator-neutral',
                    priority: 3
                });
            }
            
            if (fingerprintData.privacy.doNotTrack) {
                findings.push({
                    label: 'Do Not Track',
                    value: 'Enabled',
                    indicatorClass: 'indicator-neutral',
                    priority: 4
                });
            }
        }
        
        // Canvas fingerprinting
        if (fingerprintData.canvasFingerprint && fingerprintData.canvasFingerprint.anomalies) {
            const anomalies = fingerprintData.canvasFingerprint.anomalies;
            if (anomalies.modified) {
                findings.push({
                    label: 'Canvas Fingerprint',
                    value: 'Modified (anti-fingerprinting active)',
                    indicatorClass: 'indicator-warning',
                    priority: 5
                });
            }
        }
        
        // WebRTC leak detection
        if (fingerprintData.network && fingerprintData.network.webRTC) {
            const webRTC = fingerprintData.network.webRTC;
            if (webRTC.addresses && webRTC.addresses.length > 0) {
                const hasPublicIP = webRTC.addresses.some(addr => addr.type === 'Public');
                if (hasPublicIP) {
                    findings.push({
                        label: 'WebRTC IP Leak',
                        value: 'Public IP exposed',
                        indicatorClass: 'indicator-negative',
                        priority: 3
                    });
                }
            }
        }
        
        // Device info
        if (fingerprintData.device) {
            findings.push({
                label: 'Device Type',
                value: fingerprintData.device.deviceType || 'Unknown',
                indicatorClass: 'indicator-neutral',
                priority: 6
            });
            
            if (fingerprintData.device.touchscreen) {
                findings.push({
                    label: 'Touchscreen',
                    value: 'Available',
                    indicatorClass: 'indicator-neutral',
                    priority: 7
                });
            }
        }
        
        // Browser info
        if (fingerprintData.browser) {
            findings.push({
                label: 'Browser',
                value: `${fingerprintData.browser.browser} ${fingerprintData.browser.version}`,
                indicatorClass: 'indicator-neutral',
                priority: 8
            });
        }
        
        // Fingerprint hash
        findings.push({
            label: 'Fingerprint Hash',
            value: fingerprintHash,
            indicatorClass: 'indicator-neutral',
            priority: 9
        });
        
        // Sort by priority
        findings.sort((a, b) => a.priority - b.priority);
        
        // Add findings to the summary container
        findings.forEach(finding => {
            const item = document.createElement('div');
            item.className = 'summary-item';
            
            const indicator = document.createElement('div');
            indicator.className = `summary-indicator ${finding.indicatorClass}`;
            item.appendChild(indicator);
            
            const content = document.createElement('div');
            content.className = 'summary-content';
            
            const label = document.createElement('div');
            label.className = 'summary-label';
            label.textContent = finding.label;
            content.appendChild(label);
            
            const value = document.createElement('div');
            value.className = 'summary-value';
            value.textContent = finding.value;
            content.appendChild(value);
            
            item.appendChild(content);
            summaryContainer.appendChild(item);
        });
        
        // Add to tab
        summaryTab.appendChild(summaryContainer);
        
    } catch (e) {
        utils.log('Error creating summary tab: ' + e.message, 'error');
    }
}

// Initialize detectors
document.addEventListener('DOMContentLoaded', function() {
    try {
        // Initialize fingerprint detector
        window.utils.log('Initializing Fingerprint Detector', 'info');
        const fingerprintDetector = new FingerprintDetector();
        fingerprintDetector.detect();
        
        // Initialize API fingerprint detector
        window.utils.log('Initializing API Fingerprint Detector', 'info');
        window.apiFingerprintDetector = new APIFingerprintDetector();
        window.apiFingerprintDetector.detect();
        
        // Initialize bot detector
        window.utils.log('Initializing Bot Detector', 'info');
        const botDetector = new BotDetector(fingerprintDetector, window.apiFingerprintDetector);
        botDetector.detect();
        
        // Initialize remote desktop detector
        window.utils.log('Initializing Remote Desktop Detector', 'info');
        const remoteDesktopDetector = new RemoteDesktopDetector();
        remoteDesktopDetector.detect();
        
        // Store detectors for later reference
        window.detectors = {
            fingerprint: fingerprintDetector,
            apiFingerprint: window.apiFingerprintDetector,
            bot: botDetector,
            remoteDesktop: remoteDesktopDetector
        };
        
        // Add tab for Remote Desktop Detection
        const tabsContainer = document.querySelector('.tabs');
        if (tabsContainer) {
            const remoteDesktopTab = document.createElement('div');
            remoteDesktopTab.className = 'tab';
            remoteDesktopTab.dataset.target = 'remote-desktop-info';
            remoteDesktopTab.textContent = 'Remote Desktop';
            tabsContainer.appendChild(remoteDesktopTab);
            
            // Add click handler for the new tab
            remoteDesktopTab.addEventListener('click', function() {
                // Hide all tab content
                document.querySelectorAll('.tab-content').forEach(content => {
                    content.style.display = 'none';
                });
                
                // Show selected tab content
                const targetId = this.dataset.target;
                const targetContent = document.getElementById(targetId);
                if (targetContent) {
                    targetContent.style.display = 'block';
                }
                
                // Update active tab
                document.querySelectorAll('.tab').forEach(tab => {
                    tab.classList.remove('active');
                });
                this.classList.add('active');
            });
        }
        
    } catch (e) {
        window.utils.log('Error initializing detectors: ' + e.message, 'error');
    }
}); 