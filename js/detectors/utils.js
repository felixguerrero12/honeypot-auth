/**
 * Fingerprinting Utilities
 * Common functions used across different detection modules
 */

// Global debug flag
let DEBUG = true;

/**
 * Logger function for debugging
 * @param {string} message - Message to log
 * @param {string} level - Log level (info, warn, error)
 */
function log(message, level = 'info') {
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
    tabContent.appendChild(section);
    
    return section;
}

/**
 * Find the appropriate tab content for a section ID
 * @param {string} sectionId - Section ID to find tab for
 * @returns {HTMLElement|null} - The tab content element
 */
function findAppropriateTab(sectionId) {
    const tabMap = {
        'browser-info': document.getElementById('tab-browser'),
        'system-info': document.getElementById('tab-system'),
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
        'bot-detection': document.getElementById('tab-bot'),
        'interaction-info': document.getElementById('tab-interaction'),
        'api-fingerprint-info': document.getElementById('tab-api-fingerprint'),
        'fingerprint-result': document.getElementById('tab-basic')
    };
    
    // Log for debugging
    log(`Finding tab for section ID: ${sectionId}`, 'info');
    const foundTab = tabMap[sectionId] || document.getElementById('tab-basic');
    log(`Found tab for ${sectionId}: ${foundTab ? foundTab.id : 'none'}`, 'info');
    
    return foundTab;
}

/**
 * Add information to a section
 * @param {string} sectionId - ID of the section to add info to
 * @param {string} name - Name/label of the property
 * @param {string|number|boolean} value - Value of the property
 * @param {string} className - Optional CSS class to add to the item
 */
function addInfo(sectionId, name, value, className = '') {
    const section = document.getElementById(sectionId) || createInfoSection(sectionId, sectionId.replace('-', ' ').toUpperCase());
    const container = section.querySelector('.property-list') || section;
    
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
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to current button and content
            button.classList.add('active');
            const tabId = button.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
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
 * Export all fingerprinting data as JSON
 * @returns {string} - JSON string of all fingerprinting data
 */
function exportFingerprint() {
    const data = {};
    
    // Collect all property data
    document.querySelectorAll('.property-list li').forEach(item => {
        const section = item.closest('.info-section').id;
        const name = item.querySelector('.property-name').textContent;
        const value = item.querySelector('.property-value').textContent;
        
        if (!data[section]) data[section] = {};
        data[section][name] = value;
    });
    
    return JSON.stringify(data, null, 2);
}

/**
 * Wait for DOM content to be loaded before initializing
 */
document.addEventListener('DOMContentLoaded', function() {
    initTabs();
    
    // Setup export button if exists
    const exportBtn = document.getElementById('export-btn');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            const data = exportFingerprint();
            const blob = new Blob([data], {type: 'application/json'});
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = 'fingerprint-data.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        });
    }
}); 