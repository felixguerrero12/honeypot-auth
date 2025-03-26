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
    
    // Set the Bot Detection tab as active by default
    const botDetectionTabButton = document.querySelector('.tab-button[data-tab="tab-bot"]');
    if (botDetectionTabButton) {
        botDetectionTabButton.click();
    } else if (tabButtons.length > 0) {
        tabButtons[0].click();
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
    utils.addInfo(id, 'Status', message);
    utils.addInfo(id, 'Implementation Status', 'Not implemented yet');
    utils.addInfo(id, 'Documentation', 'See the README for information on implementing this detector.');
    
    // Add a more visible message to explain missing functionality
    const tab = findAppropriateTab(id);
    if (tab) {
        const placeholderMsg = document.createElement('div');
        placeholderMsg.className = 'placeholder-message';
        placeholderMsg.innerHTML = `
            <h3>This module is not yet implemented</h3>
            <p>The ${title} detector has been planned but not yet implemented. 
            You can implement this module by creating a new detector file in the js/detectors directory.</p>
            <div class="placeholder-features">
                <h4>Planned Features:</h4>
                <ul class="feature-list">
                    ${getPlannedFeatures(id).map(feature => `<li>${feature}</li>`).join('')}
                </ul>
            </div>
            <div class="placeholder-guidance">
                <p>Implementation guidance:</p>
                <ol>
                    <li>Create a new detector class in <code>js/detectors/${id.replace('-info', '')}.js</code></li>
                    <li>Implement the detect() method that performs the detection</li>
                    <li>Export the class via window.${id.replace('-info', '').charAt(0).toUpperCase() + id.replace('-info', '').slice(1)}Detector</li>
                </ol>
            </div>
        `;
        tab.appendChild(placeholderMsg);
    }
}

/**
 * Helper to find the appropriate tab for a section ID
 */
function findAppropriateTab(sectionId) {
    // Use the utils function if available
    if (window.utils && window.utils.findAppropriateTab) {
        return window.utils.findAppropriateTab(sectionId);
    }
    
    // Fallback mapping
    const tabMap = {
        'browser-info': document.getElementById('tab-browser'),
        'system-info': document.getElementById('tab-system'),
        'graphics-info': document.getElementById('tab-graphics'),
        'hardware-accel': document.getElementById('tab-graphics'),
        'color-depth-info': document.getElementById('tab-graphics'),
        'network-info': document.getElementById('tab-network'),
        'device-info': document.getElementById('tab-device'),
        'privacy-info': document.getElementById('tab-privacy'),
        'bot-detection': document.getElementById('tab-bot'),
        'interaction-info': document.getElementById('tab-interaction'),
        'fingerprint-result': document.getElementById('tab-basic')
    };
    
    return tabMap[sectionId] || document.getElementById('tab-basic');
}

/**
 * Returns a list of planned features for each module
 */
function getPlannedFeatures(sectionId) {
    const features = {
        'network-info': [
            'Connection type detection',
            'IP address information',
            'Network latency measurement',
            'DNS leak detection',
            'WebRTC IP detection'
        ],
        'device-info': [
            'Hardware device detection',
            'Mobile device detection',
            'Screen metrics and orientation',
            'Touch screen capability detection',
            'Device memory detection'
        ],
        'privacy-info': [
            'Cookie policy detection',
            'Do Not Track setting detection',
            'Incognito/Private browsing detection',
            'Ad blocker detection',
            'Privacy extensions detection'
        ],
        'interaction-info': [
            'Mouse movement tracking',
            'Click patterns analysis',
            'Scroll behavior analysis',
            'Keyboard usage patterns',
            'Touch interaction on mobile devices'
        ]
    };
    
    return features[sectionId] || [
        'Basic detection algorithms',
        'Data collection and analysis',
        'UI integration',
        'Results reporting'
    ];
}

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
    
    // Initialize all detectors and gather data
    initializeDetectors();
});

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
    
    // Mouse interaction detector
    try {
        if (typeof MouseInteractionDetector !== 'undefined') {
            const mouseInteractionDetector = new MouseInteractionDetector();
            fingerprintData.mouseInteraction = mouseInteractionDetector.detect();
            // Make sure content is visible
            utils.log('Mouse interaction detector initialized', 'info');
        } else {
            utils.log('Mouse interaction detector not loaded', 'warn');
            createPlaceholderSection('interaction-info', 'Mouse Interaction', 
                'Mouse interaction detection module is not currently loaded.');
        }
    } catch (e) {
        utils.log('Error initializing mouse interaction detector: ' + e.message, 'error');
        // Create a placeholder if there was an error
        createPlaceholderSection('interaction-info', 'Mouse Interaction', 
            'Error loading mouse interaction detection module: ' + e.message);
    }
    
    // Bot detection
    try {
        if (typeof BotDetector !== 'undefined') {
        const botDetector = new BotDetector();
        fingerprintData.botDetection = botDetector.detect();
            // Make sure content is visible
            utils.log('Bot detector initialized', 'info');
        } else {
            utils.log('Bot detector not loaded', 'warn');
            createPlaceholderSection('bot-detection', 'Bot Detection', 
                'Bot detection module is not currently loaded.');
        }
    } catch (e) {
        utils.log('Error initializing bot detector: ' + e.message, 'error');
        // Create a placeholder if there was an error
        createPlaceholderSection('bot-detection', 'Bot Detection', 
            'Error loading bot detection module: ' + e.message);
    }
    
    // Generate overall fingerprint hash for the Basic Info tab
    try {
        const fingerprintHash = utils.generateFingerprint(fingerprintData);
        utils.addInfo('fingerprint-result', 'Fingerprint Hash', fingerprintHash);
        
        // Make the Basic Info tab more visible
        createDetailedBasicInfo(fingerprintHash, fingerprintData);
        
        // Calculate and display fingerprint stability score
        calculateFingerprintStabilityScore(fingerprintData);
    } catch (e) {
        utils.log('Error generating fingerprint: ' + e.message, 'error');
    }
}

/**
 * Calculates and displays a fingerprint stability score
 * indicating how unique and trackable the fingerprint is
 * @param {object} fingerprintData - The collected fingerprint data
 */
function calculateFingerprintStabilityScore(fingerprintData) {
    try {
        // Create a score section if it doesn't exist
        const sectionId = 'fingerprint-stability';
        const section = utils.createInfoSection(sectionId, 'Fingerprint Stability');
        
        // Create a visual score indicator
        const scoreContainer = document.createElement('div');
        scoreContainer.className = 'score-container';
        scoreContainer.style.marginBottom = '20px';
        scoreContainer.style.padding = '15px';
        scoreContainer.style.border = '1px solid #ddd';
        scoreContainer.style.borderRadius = '8px';
        scoreContainer.style.backgroundColor = '#f9f9f9';
        
        // Data points to evaluate
        const dataPoints = {
            // Browser-based signals (high entropy)
            userAgent: fingerprintData.browser?.userAgent || navigator.userAgent,
            plugins: navigator.plugins?.length || 0,
            doNotTrack: navigator.doNotTrack || window.doNotTrack || navigator.msDoNotTrack,
            cookiesEnabled: navigator.cookieEnabled,
            
            // Device and hardware signals (stable, high entropy)
            screenSize: `${window.screen.width}x${window.screen.height}`,
            colorDepth: window.screen.colorDepth,
            deviceMemory: navigator.deviceMemory,
            hardwareConcurrency: navigator.hardwareConcurrency,
            touchPoints: navigator.maxTouchPoints,
            
            // Canvas and WebGL signals (very high entropy)
            canvasFingerprint: fingerprintData.graphics?.canvasFingerprint,
            webglFingerprint: fingerprintData.graphics?.webglFingerprint,
            
            // System signals (moderate entropy)
            platform: navigator.platform,
            language: navigator.language,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            
            // Network signals (can change, but useful)
            connectionType: fingerprintData.network?.effectiveType,
        };
        
        // Calculate score weights for different categories
        const scoreFactors = [
            // Browser factors (40% total)
            { name: 'User Agent', score: 1.0, weight: 0.15, category: 'Browser Signals' },
            { name: 'Browser Plugins', score: Math.min(dataPoints.plugins > 0 ? 0.8 : 0.3, 1.0), weight: 0.05, category: 'Browser Signals' },
            { name: 'Do Not Track Setting', score: dataPoints.doNotTrack ? 0.3 : 0.9, weight: 0.10, category: 'Browser Signals' },
            { name: 'Cookies Enabled', score: dataPoints.cookiesEnabled ? 0.9 : 0.3, weight: 0.10, category: 'Browser Signals' },
            
            // Device factors (30% total)
            { name: 'Screen Resolution', score: 0.9, weight: 0.10, category: 'Device Signals' },
            { name: 'Color Depth', score: 0.7, weight: 0.05, category: 'Device Signals' },
            { name: 'Device Memory', score: dataPoints.deviceMemory ? 0.8 : 0.4, weight: 0.05, category: 'Device Signals' },
            { name: 'CPU Cores', score: dataPoints.hardwareConcurrency ? 0.7 : 0.3, weight: 0.05, category: 'Device Signals' },
            { name: 'Touch Support', score: dataPoints.touchPoints > 0 ? 0.7 : 0.5, weight: 0.05, category: 'Device Signals' },
            
            // Canvas/WebGL (20% total)
            { name: 'Canvas Fingerprint', score: dataPoints.canvasFingerprint ? 0.95 : 0.2, weight: 0.10, category: 'Graphics Signals' },
            { name: 'WebGL Fingerprint', score: dataPoints.webglFingerprint ? 0.95 : 0.2, weight: 0.10, category: 'Graphics Signals' },
            
            // System/Network (10% total)
            { name: 'Platform', score: 0.7, weight: 0.04, category: 'System Signals' },
            { name: 'Language', score: 0.5, weight: 0.03, category: 'System Signals' },
            { name: 'Timezone', score: 0.6, weight: 0.03, category: 'System Signals' }
        ];
        
        // Categorize the factors
        const categories = {};
        let overallScore = 0;
        
        scoreFactors.forEach(factor => {
            if (!categories[factor.category]) {
                categories[factor.category] = {
                    totalWeight: 0,
                    weightedScore: 0,
                    factors: []
                };
            }
            
            // Add to this category
            categories[factor.category].factors.push(factor);
            categories[factor.category].totalWeight += factor.weight;
            categories[factor.category].weightedScore += factor.score * factor.weight;
            
            // Add to overall score
            overallScore += factor.score * factor.weight;
        });
        
        // Add heading to container
        const heading = document.createElement('h3');
        heading.textContent = 'Fingerprint Stability Score';
        heading.style.marginTop = '0';
        scoreContainer.appendChild(heading);
        
        // Add score meter
        const meterContainer = document.createElement('div');
        meterContainer.className = 'score-meter-container';
        meterContainer.style.position = 'relative';
        meterContainer.style.height = '30px';
        meterContainer.style.backgroundColor = '#e0e0e0';
        meterContainer.style.borderRadius = '15px';
        meterContainer.style.overflow = 'hidden';
        meterContainer.style.marginBottom = '10px';
        
        const meter = document.createElement('div');
        meter.className = 'score-meter';
        meter.style.height = '100%';
        meter.style.width = `${Math.min(100, Math.max(0, overallScore * 100))}%`;
        meter.style.transition = 'width 0.5s, background-color 0.5s';
        
        // Color based on score
        if (overallScore < 0.3) {
            meter.style.backgroundColor = '#4CAF50'; // Green (low trackability)
        } else if (overallScore < 0.6) {
            meter.style.backgroundColor = '#FFC107'; // Yellow (medium trackability)
    } else {
            meter.style.backgroundColor = '#F44336'; // Red (high trackability)
        }
        
        meterContainer.appendChild(meter);
        scoreContainer.appendChild(meterContainer);
        
        // Add score label
        const scoreLabel = document.createElement('div');
        scoreLabel.className = 'score-label';
        const scorePercentage = (overallScore * 100).toFixed(1);
        let trackabilityText;
        
        if (overallScore < 0.3) {
            trackabilityText = 'Low Trackability';
        } else if (overallScore < 0.6) {
            trackabilityText = 'Medium Trackability';
        } else {
            trackabilityText = 'High Trackability';
        }
        
        scoreLabel.textContent = `Score: ${scorePercentage}% - ${trackabilityText}`;
        scoreLabel.style.textAlign = 'center';
        scoreLabel.style.fontWeight = 'bold';
        scoreLabel.style.marginTop = '5px';
        scoreContainer.appendChild(scoreLabel);
        
        // Add explanation
        const explanation = document.createElement('div');
        explanation.className = 'score-explanation';
        explanation.style.marginTop = '15px';
        explanation.style.fontSize = '0.9em';
        
        if (overallScore < 0.3) {
            explanation.textContent = 'Your browser has low trackability. This means your fingerprint is less unique and harder to track across sites.';
        } else if (overallScore < 0.6) {
            explanation.textContent = 'Your browser has medium trackability. Some aspects of your configuration make you moderately identifiable.';
                } else {
            explanation.textContent = 'Your browser has high trackability. Your fingerprint is likely unique and easy to track across websites.';
        }
        
        scoreContainer.appendChild(explanation);
        
        // Add category breakdown
        const detailsHeading = document.createElement('h4');
        detailsHeading.textContent = 'Score Breakdown by Category';
        detailsHeading.style.margin = '15px 0 10px 0';
        scoreContainer.appendChild(detailsHeading);
        
        // Add each category
        Object.keys(categories).forEach(categoryName => {
            const category = categories[categoryName];
            const categoryScore = category.weightedScore / category.totalWeight;
            
            const categoryContainer = document.createElement('div');
            categoryContainer.className = 'score-category';
            categoryContainer.style.marginBottom = '5px';
            categoryContainer.style.display = 'flex';
            categoryContainer.style.justifyContent = 'space-between';
            
            const nameElement = document.createElement('span');
            nameElement.textContent = `${categoryName}:`;
            nameElement.style.flexGrow = '1';
            
            const scoreElement = document.createElement('span');
            scoreElement.textContent = `${(categoryScore * 100).toFixed(1)}%`;
            scoreElement.style.fontWeight = 'bold';
            scoreElement.style.marginLeft = '10px';
            
            // Color the score based on its value
            if (categoryScore < 0.3) {
                scoreElement.style.color = '#4CAF50'; // Green
            } else if (categoryScore < 0.6) {
                scoreElement.style.color = '#FFC107'; // Yellow
    } else {
                scoreElement.style.color = '#F44336'; // Red
            }
            
            categoryContainer.appendChild(nameElement);
            categoryContainer.appendChild(scoreElement);
            scoreContainer.appendChild(categoryContainer);
        });
        
        // Add to the section
        const propertyList = document.getElementById(sectionId).querySelector('.property-list');
        propertyList.parentNode.insertBefore(scoreContainer, propertyList);
        
        // Add overall trackability assessment to the property list
        utils.addInfo(sectionId, 'Overall Trackability', trackabilityText);
        utils.addInfo(sectionId, 'Tracking Risk', `${scorePercentage}%`);
        utils.addInfo(sectionId, 'Most Identifying Factors', 'Canvas, WebGL, and User Agent');
        utils.addInfo(sectionId, 'Privacy Recommendation', overallScore > 0.5 ? 
            'Consider using privacy tools to reduce fingerprinting' : 
            'Your current configuration has reasonable privacy protection');
        
    } catch (e) {
        utils.log('Error calculating fingerprint stability: ' + e.message, 'error');
    }
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