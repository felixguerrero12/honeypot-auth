/**
 * Remote Desktop Detection Module
 * Detects signs of remote desktop sessions through screen properties, mouse movement patterns,
 * virtual hardware detection, and input latency.
 */
class RemoteDesktopDetector {
    constructor() {
        // Use the ID that matches the tab ID in index.html
        this.sectionId = 'remote-desktop-info';
        this.tabId = 'tab-remote-desktop';
        
        this.results = {
            detected: false,
            confidence: 0,
            screenProperties: {},
            mousePatterns: {
                straightLineRatio: 0,
                consistentVelocity: false
            },
            hardware: {
                isVirtual: false,
                renderer: '',
                vendor: ''
            },
            inputLatency: {
                average: 0,
                samples: []
            }
        };
        
        // Mouse tracking
        this.mousePoints = [];
        this.straightLineCount = 0;
        this.naturalMovementCount = 0;
        this.lastAnalysisTime = 0;
        
        // Input latency tracking
        this.clickStartTimes = new Map();
        this.latencySamples = [];
        
        // Initialize
        this._createSection();
        this._setupEventListeners();
    }
    
    /**
     * Create the info section in the DOM
     */
    _createSection() {
        try {
            // Find the tab content element
            const tabContent = document.getElementById(this.tabId);
            if (!tabContent) {
                window.utils.log(`Tab content element with ID ${this.tabId} not found`, 'error');
                return;
            }
            
            // Create section if it doesn't exist
            if (!document.getElementById(this.sectionId)) {
                window.utils.log('Creating remote desktop detection section', 'info');
                
                // Create the section
                const section = document.createElement('div');
                section.id = this.sectionId;
                section.className = 'info-section';
                
                // Add heading
                const heading = document.createElement('h2');
                heading.textContent = 'Remote Desktop Detection';
                section.appendChild(heading);
                
                // Add property list container
                const propertyList = document.createElement('div');
                propertyList.className = 'property-list';
                section.appendChild(propertyList);
                
                // Add to tab content
                tabContent.appendChild(section);
                
                // Add initial status
                window.utils.addInfo(this.sectionId, 'Status', 'Analyzing...', 'section-subheader');
            } else {
                window.utils.log('Remote desktop section already exists', 'info');
            }
        } catch (e) {
            window.utils.log('Error creating remote desktop section: ' + e.message, 'error');
        }
    }
    
    /**
     * Set up event listeners for mouse movement and clicks
     */
    _setupEventListeners() {
        try {
            // Mouse movement tracking
            document.addEventListener('mousemove', this._handleMouseMove.bind(this));
            
            // Input latency tracking
            document.addEventListener('mousedown', this._handleMouseDown.bind(this));
            document.addEventListener('mouseup', this._handleMouseUp.bind(this));
            
            window.utils.log('Remote desktop detection event listeners initialized', 'info');
        } catch (e) {
            window.utils.log('Error setting up remote desktop event listeners: ' + e.message, 'error');
        }
    }
    
    /**
     * Handle mouse movement events
     */
    _handleMouseMove(e) {
        // Add point to tracking array
        this.mousePoints.push({
            x: e.clientX, 
            y: e.clientY, 
            time: performance.now()
        });
        
        // Keep only the last 20 points
        if (this.mousePoints.length > 20) {
            this.mousePoints.shift();
        }
        
        // Analyze movement every 500ms to avoid excessive calculations
        const now = performance.now();
        if (now - this.lastAnalysisTime > 500 && this.mousePoints.length >= 3) {
            this._analyzeMouseMovement();
            this.lastAnalysisTime = now;
        }
    }
    
    /**
     * Handle mouse down events for latency tracking
     */
    _handleMouseDown(e) {
        // Store start time for this button
        this.clickStartTimes.set(e.button, performance.now());
    }
    
    /**
     * Handle mouse up events for latency tracking
     */
    _handleMouseUp(e) {
        if (this.clickStartTimes.has(e.button)) {
            const startTime = this.clickStartTimes.get(e.button);
            const latency = performance.now() - startTime;
            
            // Store latency sample
            this.latencySamples.push(latency);
            if (this.latencySamples.length > 10) {
                this.latencySamples.shift(); // Keep only last 10 samples
            }
            
            // Update average
            const avgLatency = this.latencySamples.reduce((sum, val) => sum + val, 0) / this.latencySamples.length;
            this.results.inputLatency.average = avgLatency;
            this.results.inputLatency.samples = [...this.latencySamples];
            
            // Clean up
            this.clickStartTimes.delete(e.button);
            
            // Update UI occasionally
            if (this.latencySamples.length % 3 === 0) {
                this._updateLatencyInfo();
            }
        }
    }
    
    /**
     * Analyze mouse movement patterns
     */
    _analyzeMouseMovement() {
        // More forgiving thresholds for gaming mice
        const areaTolerance = 2.0; // Increased from 0.5
        const velocityToleranceFactor = 0.3; // Increased from 0.1
        
        let consistentVelocity = true;
        let previousVelocity = null;
        
        for (let i = 2; i < this.mousePoints.length; i++) {
            const p1 = this.mousePoints[i-2];
            const p2 = this.mousePoints[i-1];
            const p3 = this.mousePoints[i];
            
            // Check if points are collinear (on a straight line)
            const area = Math.abs((p1.x*(p2.y-p3.y) + p2.x*(p3.y-p1.y) + p3.x*(p1.y-p2.y))/2);
            const isStraightLine = area < areaTolerance;
            
            // Check velocity consistency with gaming mouse tolerance
            const velocity1 = Math.sqrt(Math.pow(p2.x-p1.x, 2) + Math.pow(p2.y-p1.y, 2)) / (p2.time - p1.time);
            const velocity2 = Math.sqrt(Math.pow(p3.x-p2.x, 2) + Math.pow(p3.y-p2.y, 2)) / (p3.time - p2.time);
            
            if (previousVelocity !== null) {
                // Use relative difference for velocity comparison
                const relativeVelocityDiff = Math.abs(velocity1 - previousVelocity) / Math.max(velocity1, previousVelocity);
                if (relativeVelocityDiff > velocityToleranceFactor) {
                    consistentVelocity = false;
                }
            }
            previousVelocity = velocity1;
            
            if (isStraightLine) {
                this.straightLineCount++;
            } else {
                this.naturalMovementCount++;
            }
        }
        
        // Calculate ratio and update results
        const totalMovements = this.straightLineCount + this.naturalMovementCount;
        if (totalMovements > 0) {
            // Add minimum sample size before making determination
            if (totalMovements < 30) {
                // Not enough data yet, set to low values
                this.results.mousePatterns.straightLineRatio = 0;
                this.results.mousePatterns.consistentVelocity = false;
            } else {
                const straightLineRatio = this.straightLineCount / totalMovements;
                this.results.mousePatterns.straightLineRatio = straightLineRatio;
                this.results.mousePatterns.consistentVelocity = consistentVelocity;
            }
            
            // Update UI occasionally
            if (totalMovements % 20 === 0) {
                this._updateMousePatternInfo();
            }
        }
    }
    
    /**
     * Update mouse pattern information in the UI
     */
    _updateMousePatternInfo() {
        try {
            const straightLinePercentage = (this.results.mousePatterns.straightLineRatio * 100).toFixed(1);
            window.utils.addInfo(this.sectionId, 'Straight Line Ratio', `${straightLinePercentage}%`);
            window.utils.addInfo(this.sectionId, 'Consistent Velocity', this.results.mousePatterns.consistentVelocity ? 'Yes (suspicious)' : 'No (normal)');
            
            // Determine if mouse patterns suggest remote desktop
            // More forgiving threshold for gaming mice
            const mousePatternsSuspicious = this.results.mousePatterns.straightLineRatio > 0.85 || 
                                           (this.results.mousePatterns.consistentVelocity && 
                                            this.results.mousePatterns.straightLineRatio > 0.75);
            
            window.utils.addInfo(this.sectionId, 'Mouse Patterns', 
                mousePatternsSuspicious ? 'Suspicious (remote desktop-like)' : 'Normal');
        } catch (e) {
            window.utils.log('Error updating mouse pattern info: ' + e.message, 'error');
        }
    }
    
    /**
     * Update latency information in the UI
     */
    _updateLatencyInfo() {
        try {
            const avgLatency = this.results.inputLatency.average.toFixed(2);
            window.utils.addInfo(this.sectionId, 'Average Input Latency', `${avgLatency}ms`);
            
            // Determine if latency suggests remote desktop
            const highLatency = this.results.inputLatency.average > 50;
            window.utils.addInfo(this.sectionId, 'Latency Assessment', 
                highLatency ? 'High (possible remote desktop)' : 'Normal');
        } catch (e) {
            window.utils.log('Error updating latency info: ' + e.message, 'error');
        }
    }
    
    /**
     * Detect screen properties that might indicate remote desktop
     */
    detectScreenProperties() {
        try {
            const screenData = {
                devicePixelRatio: window.devicePixelRatio,
                screenWidth: window.screen.width,
                screenHeight: window.screen.height,
                availWidth: window.screen.availWidth,
                availHeight: window.screen.availHeight,
                colorDepth: window.screen.colorDepth
            };
            
            // Common remote desktop resolution ratios
            const commonRemoteResolutions = [
                '1024x768', '1280x720', '1280x800', '1366x768', 
                '1440x900', '1600x900', '1920x1080'
            ];
            
            const currentResolution = `${screenData.screenWidth}x${screenData.screenHeight}`;
            const isCommonRemoteResolution = commonRemoteResolutions.includes(currentResolution);
            
            // Unusual color depth can indicate remote session
            const unusualColorDepth = screenData.colorDepth < 24;
            
            // Non-integer device pixel ratio is suspicious
            const nonIntegerDPR = screenData.devicePixelRatio % 1 !== 0;
            
            // Store results
            this.results.screenProperties = {
                data: screenData,
                suspiciousFactors: {
                    isCommonRemoteResolution,
                    unusualColorDepth,
                    nonIntegerDPR
                }
            };
            
            // Update UI
            window.utils.addInfo(this.sectionId, 'Screen Properties', '', 'section-subheader');
            window.utils.addInfo(this.sectionId, 'Resolution', `${screenData.screenWidth}x${screenData.screenHeight}`);
            window.utils.addInfo(this.sectionId, 'Color Depth', `${screenData.colorDepth} bit`);
            window.utils.addInfo(this.sectionId, 'Device Pixel Ratio', screenData.devicePixelRatio);
            
            // Suspicious factors
            const suspiciousFactorsCount = [
                isCommonRemoteResolution, 
                unusualColorDepth, 
                nonIntegerDPR
            ].filter(Boolean).length;
            
            window.utils.addInfo(this.sectionId, 'Suspicious Screen Factors', 
                suspiciousFactorsCount > 0 ? `${suspiciousFactorsCount} detected` : 'None');
            
            return this.results.screenProperties;
        } catch (e) {
            window.utils.log('Error detecting screen properties: ' + e.message, 'error');
            return null;
        }
    }
    
    /**
     * Detect virtual hardware through WebGL
     */
    detectVirtualHardware() {
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            
            if (!gl) {
                this.results.hardware = {
                    isVirtual: null,
                    renderer: 'No WebGL support',
                    vendor: 'No WebGL support'
                };
                
                window.utils.addInfo(this.sectionId, 'Hardware Detection', '', 'section-subheader');
                window.utils.addInfo(this.sectionId, 'WebGL Support', 'Not available');
                return this.results.hardware;
            }
            
            const renderer = gl.getParameter(gl.RENDERER);
            const vendor = gl.getParameter(gl.VENDOR);
            
            // Check for common virtual GPU strings
            const virtualGPUs = [
                'VMware', 'VirtualBox', 'llvmpipe', 'SwiftShader', 
                'Microsoft Basic Render', 'Parallels', 'SVGA3D'
            ];
            
            const isVirtual = virtualGPUs.some(vgpu => 
                renderer.includes(vgpu) || vendor.includes(vgpu)
            );
            
            // Store results
            this.results.hardware = {
                isVirtual,
                renderer,
                vendor
            };
            
            // Update UI
            window.utils.addInfo(this.sectionId, 'Hardware Detection', '', 'section-subheader');
            window.utils.addInfo(this.sectionId, 'GPU Renderer', renderer);
            window.utils.addInfo(this.sectionId, 'GPU Vendor', vendor);
            window.utils.addInfo(this.sectionId, 'Virtual GPU Detected', 
                isVirtual ? 'Yes (likely remote/virtual)' : 'No');
            
            return this.results.hardware;
        } catch (e) {
            window.utils.log('Error detecting virtual hardware: ' + e.message, 'error');
            return null;
        }
    }
    
    /**
     * Run all detection methods and calculate overall likelihood
     */
    detect() {
        try {
            window.utils.log('Running remote desktop detection', 'info');
            
            // Run all detection methods
            this.detectScreenProperties();
            this.detectVirtualHardware();
            
            // Calculate confidence score (will be updated as more data comes in)
            this._calculateConfidence();
            
            return this.results;
        } catch (e) {
            window.utils.log('Error in remote desktop detection: ' + e.message, 'error');
            return null;
        }
    }
    
    /**
     * Calculate confidence score for remote desktop detection
     */
    _calculateConfidence() {
        try {
            let score = 0;
            let factorsChecked = 0;
            
            // Screen properties (up to 30%)
            if (this.results.screenProperties.suspiciousFactors) {
                factorsChecked++;
                const suspiciousFactors = this.results.screenProperties.suspiciousFactors;
                let screenScore = 0;
                
                if (suspiciousFactors.isCommonRemoteResolution) screenScore += 0.1;
                if (suspiciousFactors.unusualColorDepth) screenScore += 0.1;
                if (suspiciousFactors.nonIntegerDPR) screenScore += 0.1;
                
                score += screenScore;
            }
            
            // Virtual hardware (up to 30%)
            if (this.results.hardware.isVirtual !== null) {
                factorsChecked++;
                if (this.results.hardware.isVirtual) {
                    score += 0.3;
                }
            }
            
            // Mouse patterns (up to 25%)
            if (this.straightLineCount + this.naturalMovementCount > 30) { // Increased minimum sample size
                factorsChecked++;
                let mouseScore = 0;
                
                // More forgiving thresholds for gaming mice
                if (this.results.mousePatterns.straightLineRatio > 0.85) mouseScore += 0.15;
                else if (this.results.mousePatterns.straightLineRatio > 0.75 && this.results.mousePatterns.consistentVelocity) mouseScore += 0.15;
                else if (this.results.mousePatterns.straightLineRatio > 0.75) mouseScore += 0.1;
                
                score += mouseScore;
            }
            
            // Input latency (up to 15%)
            if (this.latencySamples.length >= 3) {
                factorsChecked++;
                if (this.results.inputLatency.average > 50) {
                    score += 0.15;
                }
            }
            
            // Calculate final confidence (0-100%)
            const confidence = factorsChecked > 0 ? (score / factorsChecked) * 100 : 0;
            this.results.confidence = Math.min(Math.round(confidence), 100);
            this.results.detected = this.results.confidence > 60;
            
            // Update UI
            window.utils.addInfo(this.sectionId, 'Remote Desktop Confidence', 
                `${this.results.confidence}%`, 
                this.results.detected ? 'warning-indicator' : '');
            
            window.utils.addInfo(this.sectionId, 'Detection Result', 
                this.results.detected ? 'Remote Desktop Detected' : 'No Remote Desktop Detected',
                this.results.detected ? 'warning-indicator' : '');
            
            return this.results.confidence;
        } catch (e) {
            window.utils.log('Error calculating remote desktop confidence: ' + e.message, 'error');
            return 0;
        }
    }
}

// Export for use in main.js
window.RemoteDesktopDetector = RemoteDesktopDetector; 