/**
 * Bot Detection Module
 * Focuses on detecting automated behavior patterns in user interaction,
 * particularly mouse movements and timing patterns
 */

class BotDetector {
    constructor() {
        this.sectionId = 'bot-detection';
        this.sectionTitle = 'Bot Detection';
        this.botData = {};
        
        // Mouse movement tracking data
        this.mouseData = {
            movements: 0,
            positions: [],
            timestamps: [],
            velocities: [],
            angles: [],
            // New data for advanced bot detection
            minX: Infinity,
            maxX: -Infinity,
            minY: Infinity,
            maxY: -Infinity,
            sumX: 0,
            sumY: 0,
            // Min/max/avg velocities
            minVelocity: Infinity,
            maxVelocity: -Infinity,
            sumVelocity: 0,
            // Min/max/avg movement angles
            minAngle: Infinity,
            maxAngle: -Infinity,
            sumAngle: 0,
            // Time between movements
            lastMovementTime: 0,
            timeBetweenMovements: [],
            minTimeBetween: Infinity,
            maxTimeBetween: -Infinity,
            sumTimeBetween: 0,
            // Event timing data
            eventTimings: {
                mouseEventDelays: [],
                keyEventDelays: [],
                touchEventDelays: []
            }
        };
        
        // Suspicious patterns indicators
        this.suspiciousPatterns = {
            perfectStraightLines: 0,
            consistentVelocity: false,
            consistentAngles: false,
            consistentTimeBetween: false,
            unnaturalMovement: false,
            apiAnomalies: false,
            eventTimingAnomalies: 0  // New property for event timing anomalies
        };
        
        // Bot detection thresholds
        this.thresholds = {
            minimumSamples: 20,
            velocityVariance: 0.05, // 5% variance for consistent velocity
            angleVariance: 8, // Increased from 3 to 8 degrees for more natural human movement detection
            timeVariance: 0.05, // 5% variance for consistent timing
            straightLineThreshold: 20, // Increased from 5 to 20 - humans naturally make many short straight movements
            perfectPatternThreshold: 0.97, // 97% similarity for pattern detection
            
            // Modified score thresholds to make more sense with individual pattern detection
            humanScoreThreshold: 0.3,      // Below this is "Likely human"
            suspiciousScoreThreshold: 0.5, // Above this is "Suspicious patterns"
            botScoreThreshold: 0.7,        // Above this is "Highly likely to be a bot"
            minMovementsForAnalysis: 30,
            consistentAngleThreshold: 0.05,
            consistentVelocityThreshold: 0.1
        };
        
        // Score weights for different detection factors
        this.scoreWeights = {
            mousePatterns: 0.25,    // 25% of score from mouse movement patterns
            headlessBrowser: 0.15,  // 15% from headless browser detection
            fakeUserAgent: 0.15,    // 15% from user agent inconsistencies
            unusualResolution: 0.10, // 10% from screen resolution anomalies
            rdpDetection: 0.10,     // 10% from RDP detection
            fingerprinting: 0.15,   // 15% from fingerprint analysis
            apiFingerprint: 0.10,    // 10% from API fingerprint analysis
            eventTimingPatterns: 0.15 // Weight for event timing patterns
        };
        
        // Initialize detection scores
        this.detectionScores = {
            mousePatterns: 0,
            headlessBrowser: 0,
            fakeUserAgent: 0,
            unusualResolution: 0,
            rdpDetection: 0,
            fingerprinting: 0,      // Fingerprint-based score
            apiFingerprint: 0,      // API fingerprinting score
            eventTimingPatterns: 0, // New score for event timing patterns
            overallScore: 0         // Overall weighted score
        };
    }

    /**
     * Start bot detection
     */
    detect() {
        this._createSection();
        this._setupMouseTracking();
        
        // Run automated detection tests
        this._detectHeadlessBrowser();
        this._detectFakeUserAgent();
        this._detectUnusualScreenResolution();
        this._detectRDP();
        this._detectFingerprintAnomalies(); // Canvas fingerprint detection
        this._detectAPIAnomalies(); // API fingerprint detection
        
        // Create the score display
        this._updateUI();
        
        // Setup analysis interval for mouse movement analysis
        setInterval(() => {
            this._analyzeAndUpdateResults();
            this._updateUI();
        }, 2000);
        
        return this.botData;
    }

    /**
     * Create the bot detection section in the DOM
     */
    _createSection() {
        // Add debug log to see if this method is being called
        if (window.utils && window.utils.log) {
            window.utils.log('Creating bot detection section', 'info');
        } else {
            console.log('Creating bot detection section');
        }
        
        return window.utils.createInfoSection(this.sectionId, this.sectionTitle);
    }
    
    /**
     * Analyze mouse data and update results in the UI with improved reporting
     */
    _analyzeAndUpdateResults() {
        if (this.mouseData.movements < this.thresholds.minimumSamples) {
            window.utils.addInfo(this.sectionId, 'Status', 'Collecting data...');
            window.utils.addInfo(this.sectionId, 'Mouse Events', this.mouseData.movements);
            return;
        }
        
        // Calculate averages
        const avgX = this.mouseData.sumX / this.mouseData.movements;
        const avgY = this.mouseData.sumY / this.mouseData.movements;
        
        const avgVelocity = this.mouseData.velocities.length > 0 ? 
            this.mouseData.sumVelocity / this.mouseData.velocities.length : 0;
            
        const avgAngle = this.mouseData.angles.length > 0 ? 
            this.mouseData.sumAngle / this.mouseData.angles.length : 0;
            
        const avgTimeBetween = this.mouseData.timeBetweenMovements.length > 0 ?
            this.mouseData.sumTimeBetween / this.mouseData.timeBetweenMovements.length : 0;
        
        // Analyze for suspicious patterns
        this._analyzeForBotPatterns(avgVelocity, avgAngle, avgTimeBetween);
        
        // Update UI with results
        window.utils.addInfo(this.sectionId, 'Mouse Events', this.mouseData.movements);
        
        // Position stats
        window.utils.addInfo(this.sectionId, 'Position Range X', `${Math.round(this.mouseData.minX)} to ${Math.round(this.mouseData.maxX)}`);
        window.utils.addInfo(this.sectionId, 'Position Range Y', `${Math.round(this.mouseData.minY)} to ${Math.round(this.mouseData.maxY)}`);
        window.utils.addInfo(this.sectionId, 'Average Position', `X: ${Math.round(avgX)}, Y: ${Math.round(avgY)}`);
        
        // Velocity stats
        window.utils.addInfo(this.sectionId, 'Velocity (px/ms)', 
            `Min: ${this.mouseData.minVelocity.toFixed(3)}, Max: ${this.mouseData.maxVelocity.toFixed(3)}, Avg: ${avgVelocity.toFixed(3)}`);
        
        // Time between movements
        window.utils.addInfo(this.sectionId, 'Time Between Movements (ms)', 
            `Min: ${this.mouseData.minTimeBetween}, Max: ${this.mouseData.maxTimeBetween}, Avg: ${avgTimeBetween.toFixed(2)}`);
        
        // Calculate overall bot likelihood and update scores
        this._calculateBotLikelihood();
        this._calculateOverallScore();
        
        // Update the score indicator
        this._updateScoreIndicator();
        
        // Bot detection results
        const botStatus = this._getBotStatusLabel(this.detectionScores.overallScore);
        
        // First, remove all suspicious pattern entries
        const container = document.getElementById(this.sectionId).querySelector('.property-list');
        const existingPatterns = container.querySelectorAll('li');
        for (let i = 0; i < existingPatterns.length; i++) {
            const item = existingPatterns[i];
            const itemName = item.querySelector('.property-name')?.textContent;
            
            if (itemName === 'Suspicious Pattern') {
                container.removeChild(item);
            }
        }
        
        // Then add current suspicious patterns
        window.utils.addInfo(this.sectionId, 'Bot Detection Status', botStatus);
        
        // Add explanatory information about any detected patterns
        if (this.suspiciousPatterns.consistentVelocity) {
            window.utils.addInfo(this.sectionId, 'Suspicious Pattern', 'Consistent movement velocity');
        }
        
        if (this.suspiciousPatterns.consistentAngles) {
            window.utils.addInfo(
                this.sectionId, 
                'Suspicious Pattern', 
                `Too many straight lines (${this.suspiciousPatterns.perfectStraightLines} detected)`
            );
        }
        
        if (this.suspiciousPatterns.consistentTimeBetween) {
            window.utils.addInfo(this.sectionId, 'Suspicious Pattern', 'Consistent timing between movements');
        }
        
        if (this.suspiciousPatterns.unnaturalMovement) {
            window.utils.addInfo(this.sectionId, 'Suspicious Pattern', 'Unnatural movement consistency');
        }
    }

    /**
     * Analyze for bot patterns with improved diagnostic output
     */
    _analyzeForBotPatterns(avgVelocity, avgAngle, avgTimeBetween) {
        // Check for consistent velocity
        if (this.mouseData.minVelocity > 0 && avgVelocity > 0) {
            const velocityRatio = this.mouseData.minVelocity / this.mouseData.maxVelocity;
            this.suspiciousPatterns.consistentVelocity = velocityRatio > this.thresholds.perfectPatternThreshold;
            if (this.suspiciousPatterns.consistentVelocity) {
                window.utils.log(`Bot detection: Found suspiciously consistent velocity ratio: ${velocityRatio.toFixed(4)}`, 'warn');
            }
        }
        
        // Check for consistent angles (straight lines)
        if (this.mouseData.angles.length > 0) {
            // Add debug logging to understand the angle distribution
            window.utils.log(`Bot detection: Angle analysis - min: ${this.mouseData.minAngle.toFixed(2)}, max: ${this.mouseData.maxAngle.toFixed(2)}, avg: ${avgAngle.toFixed(2)}`, 'info');
            
            // Count how many movements follow a similar angle
            let straightLineCount = 0;
            let prevAngle = this.mouseData.angles[0];
            let prevPosition = this.mouseData.positions[0];
            let straightLineSegments = [];
            
            for (let i = 1; i < this.mouseData.angles.length; i++) {
                const angle = this.mouseData.angles[i];
                const position = this.mouseData.positions[i];
                const diff = Math.abs(angle - prevAngle);
                
                // Calculate distance between current and previous position
                const dx = position.x - prevPosition.x;
                const dy = position.y - prevPosition.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                // Only count as a straight line if there was actual movement
                // Modified to require a minimum distance to be considered a meaningful movement
                const MIN_MOVEMENT_DISTANCE = 10; // pixels - increased from 5 to 10 pixels
                
                if (distance > MIN_MOVEMENT_DISTANCE && 
                    (diff < this.thresholds.angleVariance || diff > (180 - this.thresholds.angleVariance))) {
                    straightLineCount++;
                    
                    // Record this segment for debugging
                    straightLineSegments.push({
                        distance: distance.toFixed(1),
                        angleDiff: diff.toFixed(2),
                        angle: angle.toFixed(1)
                    });
                }
                
                prevAngle = angle;
                prevPosition = position;
            }
            
            // Debug log details of the first few straight line segments detected
            if (straightLineSegments.length > 0) {
                const sampleSize = Math.min(5, straightLineSegments.length);
                window.utils.log(`Bot detection: First ${sampleSize} straight line segments:`, 'info');
                for (let i = 0; i < sampleSize; i++) {
                    const seg = straightLineSegments[i];
                    window.utils.log(`  Segment ${i+1}: distance=${seg.distance}px, angle=${seg.angle}°, diff=${seg.angleDiff}°`, 'info');
                }
            }
            
            // Calculate percentage of movements that are straight lines
            const straightLinePercentage = (straightLineCount / this.mouseData.angles.length) * 100;
            
            // Use percentage-based threshold instead of absolute count
            // Most humans have 20-40% straight segments naturally
            const PERCENTAGE_THRESHOLD = 45; // Flag if more than 45% of movements are straight lines
            
            if (straightLinePercentage > PERCENTAGE_THRESHOLD && this.mouseData.angles.length >= 50) {
                this.suspiciousPatterns.consistentAngles = true;
                this.suspiciousPatterns.perfectStraightLines = straightLineCount;
                window.utils.log(`Bot detection: Found ${straightLinePercentage.toFixed(1)}% straight line movements (threshold: ${PERCENTAGE_THRESHOLD}%)`, 'warn');
            } else {
                // Reset the suspicious pattern if we're now under threshold
                if (this.suspiciousPatterns.consistentAngles) {
                    this.suspiciousPatterns.consistentAngles = false;
                    this.suspiciousPatterns.perfectStraightLines = 0;
                }
                window.utils.log(`Bot detection: Found ${straightLinePercentage.toFixed(1)}% straight lines (below threshold: ${PERCENTAGE_THRESHOLD}%)`, 'info');
            }
            
            // Debug count of movements vs straight lines for percentage
            window.utils.log(`Bot detection: Straight line percentage: ${straightLinePercentage.toFixed(1)}% (${straightLineCount}/${this.mouseData.angles.length})`, 'info');
        }
        
        // Check for consistent timing
        if (this.mouseData.timeBetweenMovements.length > 0) {
            const timeRatio = this.mouseData.minTimeBetween / this.mouseData.maxTimeBetween;
            this.suspiciousPatterns.consistentTimeBetween = timeRatio > this.thresholds.perfectPatternThreshold;
            if (this.suspiciousPatterns.consistentTimeBetween) {
                window.utils.log(`Bot detection: Found suspiciously consistent timing ratio: ${timeRatio.toFixed(4)}`, 'warn');
            }
        }
        
        // Check for unnatural movement
        // If min, max, and avg are all very close, it's likely a bot
        if (avgVelocity > 0 && this.mouseData.minVelocity > 0) {
            const minMaxDiff = Math.abs(this.mouseData.maxVelocity - this.mouseData.minVelocity);
            const normalizedDiff = minMaxDiff / avgVelocity;
            
            this.suspiciousPatterns.unnaturalMovement = normalizedDiff < this.thresholds.velocityVariance;
            if (this.suspiciousPatterns.unnaturalMovement) {
                window.utils.log(`Bot detection: Found unnaturally consistent movement patterns: ${normalizedDiff.toFixed(4)}`, 'warn');
            }
        }
    }

    /**
     * Calculate likelihood that this is a bot based on mouse movements
     * Returns a value between 0-1 where higher means more likely to be a bot
     */
    _calculateBotLikelihood() {
        let score = 0;
        let factorsChecked = 0;
        
        // Check for consistent velocity
        if (this.mouseData.velocities.length > 0) {
            factorsChecked++;
            let velocityScore = 0;
            if (this.suspiciousPatterns.consistentVelocity) {
                velocityScore = 1;
                window.utils.log(`Bot detection: Velocity pattern suspicious, adding score 1`, 'info');
            } else {
                // Calculate variance in velocity
                const variance = (this.mouseData.maxVelocity - this.mouseData.minVelocity) / 
                    (this.mouseData.maxVelocity + this.mouseData.minVelocity) * 2;
                
                // Natural mouse movements have higher variance
                velocityScore = (1 - Math.min(variance, 1));
                window.utils.log(`Bot detection: Velocity variance ${variance.toFixed(4)}, adding score ${velocityScore.toFixed(4)}`, 'info');
            }
            score += velocityScore;
        }
        
        // Check for straight lines - with improved scoring that considers normal human behavior
        if (this.mouseData.angles.length > 0) {
            factorsChecked++;
            let angleScore = 0;
            
            if (this.suspiciousPatterns.consistentAngles) {
                // Calculate a score based on percentage of straight lines
                const straightLines = this.suspiciousPatterns.perfectStraightLines;
                const straightLinePercentage = (straightLines / this.mouseData.angles.length) * 100;
                
                // Instead of binary scoring, use a graduated approach based on percentage
                if (straightLinePercentage > 60 && this.mouseData.angles.length >= 50) {
                    // Extremely high percentage - likely a bot
                    angleScore = 0.8;
                    window.utils.log(`Bot detection: Extremely high straight line percentage (${straightLinePercentage.toFixed(1)}%), adding score 0.8`, 'info');
                } else if (straightLinePercentage > 45 && this.mouseData.angles.length >= 50) {
                    // High percentage - somewhat suspicious
                    angleScore = 0.5;
                    window.utils.log(`Bot detection: High straight line percentage (${straightLinePercentage.toFixed(1)}%), adding score 0.5`, 'info');
                } else {
                    // Moderately elevated
                    angleScore = 0.3;
                    window.utils.log(`Bot detection: Elevated straight line percentage (${straightLinePercentage.toFixed(1)}%), adding score 0.3`, 'info');
                }
            } else {
                angleScore = 0;
                window.utils.log(`Bot detection: No suspicious straight lines found, adding score 0`, 'info');
            }
            score += angleScore;
        }
        
        // Check for consistent timing
        if (this.mouseData.timeBetweenMovements.length > 0) {
            factorsChecked++;
            let timingScore = 0;
            if (this.suspiciousPatterns.consistentTimeBetween) {
                timingScore = 1;
                window.utils.log(`Bot detection: Timing pattern suspicious, adding score 1`, 'info');
            } else {
                // Calculate variance in timing
                const timeVariance = (this.mouseData.maxTimeBetween - this.mouseData.minTimeBetween) / 
                    (this.mouseData.maxTimeBetween + this.mouseData.minTimeBetween) * 2;
                
                timingScore = (1 - Math.min(timeVariance, 1));
                window.utils.log(`Bot detection: Time variance ${timeVariance.toFixed(4)}, adding score ${timingScore.toFixed(4)}`, 'info');
            }
            score += timingScore;
        }
        
        // Add checking for consecutive straight lines which is more suspicious than just straight lines
        if (this.mouseData.angles.length > this.thresholds.minimumSamples) {
            factorsChecked++;
            
            // Count sequences of 3+ consecutive straight segments (a stronger bot indicator)
            let consecutiveCount = 0;
            let maxConsecutive = 0;
            let prevAngle = this.mouseData.angles[0];
            let prevPosition = this.mouseData.positions[0];
            let prevTimestamp = this.mouseData.timestamps[0];
            let isHighSpeedSequence = false;
            let totalDistance = 0;
            
            for (let i = 1; i < this.mouseData.angles.length; i++) {
                const angle = this.mouseData.angles[i];
                const position = this.mouseData.positions[i];
                const timestamp = this.mouseData.timestamps[i];
                const diff = Math.abs(angle - prevAngle);
                
                // Calculate distance
                const dx = position.x - prevPosition.x;
                const dy = position.y - prevPosition.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                totalDistance += distance;
                
                // Calculate speed in pixels per ms
                const timeDelta = timestamp - prevTimestamp;
                const speed = timeDelta > 0 ? distance / timeDelta : 0;
                
                // Check if this continues a straight line (significant movement in same direction)
                // Now requiring both minimum distance and reasonable angle similarity
                const MIN_SIGNIFICANT_DISTANCE = 10; // Increased from 5 to 10 pixels
                
                if (distance > MIN_SIGNIFICANT_DISTANCE && 
                    (diff < this.thresholds.angleVariance || diff > (180 - this.thresholds.angleVariance))) {
                    consecutiveCount++;
                    
                    // Track if this is a high-speed sequence (more suspicious than slow drawing)
                    if (speed > 0.5) { // 0.5 pixels/ms = quite fast movement
                        isHighSpeedSequence = true;
                    }
                    
                    maxConsecutive = Math.max(maxConsecutive, consecutiveCount);
                } else {
                    // Reset consecutive count when angle changes significantly
                    consecutiveCount = 0;
                }
                
                prevAngle = angle;
                prevPosition = position;
                prevTimestamp = timestamp;
            }
            
            // Score based on consecutive straight segments with consideration of speed and distance
            let consecutiveScore = 0;
            
            // Much more forgiving thresholds - humans can easily move in straight lines for a reasonable distance
            if (maxConsecutive >= 20 && isHighSpeedSequence && totalDistance > 500) {
                // Extremely suspicious - long sequence of fast straight movements covering large distance
                consecutiveScore = 0.9;
                window.utils.log(`Bot detection: Found ${maxConsecutive} consecutive straight movements at high speed - very suspicious`, 'warn');
            } else if (maxConsecutive >= 15 && isHighSpeedSequence) {
                // Quite suspicious - moderate sequence at high speed
                consecutiveScore = 0.7;
                window.utils.log(`Bot detection: Found ${maxConsecutive} consecutive straight movements at high speed - suspicious`, 'warn');
            } else if (maxConsecutive >= 25) { 
                // Long sequences may be suspicious regardless of speed
                consecutiveScore = 0.5;
                window.utils.log(`Bot detection: Found ${maxConsecutive} consecutive straight movements - somewhat suspicious`, 'info');
            } else {
                // Normal human behavior
                consecutiveScore = 0;
                window.utils.log(`Bot detection: Max consecutive straight movements: ${maxConsecutive} - normal human behavior`, 'info');
            }
            
            score += consecutiveScore;
        }
        
        // Calculate mouse pattern score
        const mousePatternScore = factorsChecked > 0 ? score / factorsChecked : 0;
        this.detectionScores.mousePatterns = mousePatternScore;
        
        window.utils.log(`Bot detection: Mouse pattern score ${mousePatternScore.toFixed(4)} from ${factorsChecked} factors`, 'info');
        
        return mousePatternScore;
    }
    
    /**
     * Calculate the overall bot detection score
     */
    _calculateOverallScore() {
        try {
            // Calculate weighted average of all scores
            let totalWeight = 0;
            let weightedScore = 0;
            
            for (const [key, weight] of Object.entries(this.scoreWeights)) {
                if (this.detectionScores[key] !== undefined) {
                    weightedScore += this.detectionScores[key] * weight;
                    totalWeight += weight;
                }
            }
            
            // Add event timing score if available
            if (this.detectionScores.eventTimingPatterns !== undefined) {
                weightedScore += this.detectionScores.eventTimingPatterns * this.scoreWeights.eventTimingPatterns;
                totalWeight += this.scoreWeights.eventTimingPatterns;
            }
            
            // Normalize to account for missing scores
            const normalizedScore = totalWeight > 0 ? weightedScore / totalWeight : 0;
            
            // Set the overall score
            this.detectionScores.overallScore = normalizedScore;
            
            // Update the UI with the score
            this._updateScoreIndicator();
            
            return normalizedScore;
        } catch (e) {
            window.utils.log('Error calculating overall score: ' + e.message, 'error');
            return 0;
        }
    }

    /**
     * Get a human-readable status based on bot likelihood score
     */
    _getBotStatusLabel(score) {
        if (this.mouseData.movements < this.thresholds.minimumSamples) {
            return 'Insufficient data';
        }
        
        // Use the new thresholds
        if (score >= this.thresholds.botScoreThreshold) {
            return 'Highly likely to be a bot';
        } else if (score >= this.thresholds.suspiciousScoreThreshold) {
            return 'Suspicious patterns detected';
        } else if (score >= this.thresholds.humanScoreThreshold) {
            return 'Some unusual patterns';
        } else {
            return 'Likely human';
        }
    }

    /**
     * Detect if browser is headless
     */
    _detectHeadlessBrowser() {
        try {
            // Initialize test results
            let isHeadless = false;
            const headlessTests = [];
            let headlessScore = 0;
            let testsRun = 0;
            
            // Test 1: Check user agent for headless indicators
            testsRun++;
            const ua = navigator.userAgent;
            if (/(headless|Headless|puppet|Puppet|PhantomJS|Nightmare|selenium|Selenium|webdriver|WebDriver)/i.test(ua)) {
                headlessTests.push('User agent contains headless browser indicators');
                isHeadless = true;
                headlessScore += 1.0; // Strong indicator
            }
            
            // Test 2: Check for navigator.webdriver
            testsRun++;
            if (navigator.webdriver) {
                headlessTests.push('navigator.webdriver is true');
                isHeadless = true;
                headlessScore += 1.0; // Strong indicator
            }
            
            // Test 3: Check for Chrome Headless
            testsRun++;
            if (/Chrome/.test(ua) && !window.chrome) {
                headlessTests.push('Chrome user agent without chrome object');
                isHeadless = true;
                headlessScore += 0.8; // Good indicator
            }
            
            // Test 4: Check for Permissions behavior difference
            if (navigator.permissions) {
                testsRun++;
                navigator.permissions.query({name: 'notifications'})
                    .then(permission => {
                        if (permission.state === 'denied' && Notification.permission === 'default') {
                            window.utils.addInfo(this.sectionId, 'Headless Browser Indicator', 'Inconsistent permissions behavior');
                            isHeadless = true;
                            headlessScore += 0.7; // Decent indicator
                            this.detectionScores.headlessBrowser = Math.min(1.0, headlessScore / testsRun);
                            this._calculateOverallScore();
                            this._updateScoreIndicator();
                        }
                    })
                    .catch(() => {});
            }
            
            // Test 5: Check for plugins (headless browsers usually have none)
            testsRun++;
            if (navigator.plugins.length === 0) {
                headlessTests.push('No plugins detected');
                headlessScore += 0.3; // Weak indicator
            }
            
            // Calculate headless browser score
            this.detectionScores.headlessBrowser = Math.min(1.0, headlessScore / testsRun);
            
            // Report findings
            this.botData.isHeadlessBrowser = isHeadless;
            window.utils.addInfo(this.sectionId, 'Headless Browser Detection', isHeadless ? 'Detected' : 'Not detected');
            
            if (headlessTests.length > 0) {
                window.utils.addInfo(this.sectionId, 'Headless Browser Indicators', headlessTests.join(', '));
            }
        } catch (e) {
            window.utils.log('Error in headless browser detection: ' + e.message, 'error');
        }
    }
    
    /**
     * Detect fake or spoofed user agent
     */
    _detectFakeUserAgent() {
        try {
            let isFakeUA = false;
            const uaInconsistencies = [];
            let fakeUAScore = 0;
            let testsRun = 0;
            
            const ua = navigator.userAgent;
            
            // Test 1: Browser feature inconsistency
            testsRun++;
            if (/Firefox/.test(ua) && !window.InstallTrigger) {
                uaInconsistencies.push('Firefox UA without Firefox features');
                isFakeUA = true;
                fakeUAScore += 1.0;
            }
            
            testsRun++;
            if (/Safari/.test(ua) && !window.safari && !/Chrome/.test(ua)) {
                uaInconsistencies.push('Safari UA without Safari features');
                isFakeUA = true;
                fakeUAScore += 1.0;
            }
            
            testsRun++;
            if (/Chrome/.test(ua) && !window.chrome) {
                uaInconsistencies.push('Chrome UA without Chrome features');
                isFakeUA = true;
                fakeUAScore += 1.0;
            }
            
            // Test 2: OS inconsistency
            testsRun++;
            if (/Windows/.test(ua) && /Mac OS X/.test(ua)) {
                uaInconsistencies.push('UA contains both Windows and Mac OS');
                isFakeUA = true;
                fakeUAScore += 1.0;
            }
            
            testsRun++;
            if (/Android/.test(ua) && /Windows/.test(ua)) {
                uaInconsistencies.push('UA contains both Android and Windows');
                isFakeUA = true;
                fakeUAScore += 1.0;
            }
            
            // Test 3: Version inconsistency
            testsRun++;
            if (/Chrome\/(\d+)/.test(ua) && /Firefox\/(\d+)/.test(ua)) {
                uaInconsistencies.push('UA contains both Chrome and Firefox versions');
                isFakeUA = true;
                fakeUAScore += 1.0;
            }
            
            // Calculate fake user agent score
            this.detectionScores.fakeUserAgent = testsRun > 0 ? Math.min(1.0, fakeUAScore / testsRun) : 0;
            
            // Report findings
            this.botData.isFakeUserAgent = isFakeUA;
            window.utils.addInfo(this.sectionId, 'Fake User Agent Detection', isFakeUA ? 'Detected' : 'Not detected');
            
            if (uaInconsistencies.length > 0) {
                window.utils.addInfo(this.sectionId, 'User Agent Inconsistencies', uaInconsistencies.join(', '));
            }
            
        } catch (e) {
            window.utils.log('Error in fake user agent detection: ' + e.message, 'error');
        }
    }
    
    /**
     * Detect unusual or fake screen resolution
     */
    _detectUnusualScreenResolution() {
        try {
            let isUnusualResolution = false;
            const screenIssues = [];
            let resolutionScore = 0;
            let testsRun = 0;
            
            // Test 1: Check for very small resolution
            testsRun++;
            if (window.screen.width <= 1 || window.screen.height <= 1) {
                screenIssues.push('1x1 pixel or smaller resolution');
                isUnusualResolution = true;
                resolutionScore += 1.0;
            }
            
            // Test 2: Check for unrealistic resolution
            testsRun++;
            if (window.screen.width > 8000 || window.screen.height > 8000) {
                screenIssues.push('Unusually large resolution');
                isUnusualResolution = true;
                resolutionScore += 0.8;
            }
            
            // Test 3: Check for inconsistent dimensions
            testsRun++;
            if (window.outerWidth > window.screen.width || window.outerHeight > window.screen.height) {
                screenIssues.push('Window size larger than screen size');
                isUnusualResolution = true;
                resolutionScore += 0.9;
            }
            
            // Test 4: Check for unusual aspect ratio
            testsRun++;
            const aspectRatio = window.screen.width / window.screen.height;
            if (aspectRatio < 0.5 || aspectRatio > 3.0) {
                screenIssues.push('Unusual aspect ratio: ' + aspectRatio.toFixed(2));
                isUnusualResolution = true;
                resolutionScore += 0.7;
            }
            
            // Calculate screen resolution score
            this.detectionScores.unusualResolution = testsRun > 0 ? Math.min(1.0, resolutionScore / testsRun) : 0;
            
            // Report findings
            this.botData.isUnusualResolution = isUnusualResolution;
            window.utils.addInfo(this.sectionId, 'Screen Resolution', `${window.screen.width}x${window.screen.height}`);
            window.utils.addInfo(this.sectionId, 'Unusual Resolution', isUnusualResolution ? 'Detected' : 'Not detected');
            
            if (screenIssues.length > 0) {
                window.utils.addInfo(this.sectionId, 'Screen Resolution Issues', screenIssues.join(', '));
            }
            
        } catch (e) {
            window.utils.log('Error in unusual screen resolution detection: ' + e.message, 'error');
        }
    }
    
    /**
     * Detect Remote Desktop Protocol (RDP) usage
     */
    _detectRDP() {
        try {
            // Check if color depth data is available from graphics detector
            const colorDepthSection = document.getElementById('color-depth-info');
            let isRDP = false;
            let rdpConfidence = '';
            let rdpScore = 0;
            
            if (colorDepthSection) {
                const rdpItems = colorDepthSection.querySelectorAll('li');
                
                // Look for RDP detection result
                for (let i = 0; i < rdpItems.length; i++) {
                    const item = rdpItems[i];
                    const itemName = item.querySelector('.property-name')?.textContent;
                    const itemValue = item.querySelector('.property-value')?.textContent;
                    
                    if (itemName === 'RDP Connection Detected') {
                        isRDP = itemValue === 'Yes';
                        rdpScore = isRDP ? 0.9 : 0;
                    } else if (itemName === 'RDP Detection Confidence') {
                        rdpConfidence = itemValue;
                        // Parse confidence if it's a percentage
                        if (rdpConfidence && rdpConfidence.includes('%')) {
                            const confidenceValue = parseFloat(rdpConfidence) / 100;
                            if (!isNaN(confidenceValue)) {
                                rdpScore = confidenceValue;
                            }
                        }
                    }
                }
                
                // Add RDP detection to bot detection section
                this.botData.isRDP = isRDP;
                window.utils.addInfo(this.sectionId, 'Remote Desktop (RDP)', isRDP ? 'Detected' : 'Not detected');
                
                if (isRDP) {
                    window.utils.addInfo(this.sectionId, 'RDP Confidence', rdpConfidence);
                }
            } else {
                // Fallback RDP detection if color depth section isn't available
                const jsColorDepth = window.screen.colorDepth || window.screen.pixelDepth || 'Not available';
                
                // RDP often uses 8 or 16 bit color depth
                if (jsColorDepth === 8) {
                    isRDP = true;
                    rdpScore = 0.9; // High confidence for 8-bit color
                } else if (jsColorDepth === 16) {
                    isRDP = true;
                    rdpScore = 0.7; // Medium confidence for 16-bit color
                } else if (jsColorDepth === 24 && navigator.userAgent.includes('Windows')) {
                    // Some possibility on Windows with 24-bit
                    rdpScore = 0.3;
                }
                
                this.botData.isRDP = isRDP;
                window.utils.addInfo(this.sectionId, 'Remote Desktop (RDP)', 
                    isRDP ? 'Detected (based on color depth)' : 'Not detected');
                window.utils.addInfo(this.sectionId, 'Color Depth', jsColorDepth + ' bit');
            }
            
            // Set RDP detection score
            this.detectionScores.rdpDetection = rdpScore;
            
        } catch (e) {
            window.utils.log('Error in RDP detection: ' + e.message, 'error');
        }
    }

    /**
     * Setup mouse movement tracking
     */
    _setupMouseTracking() {
        document.addEventListener('mousemove', (e) => {
            const timestamp = Date.now();
            const position = { x: e.clientX, y: e.clientY };
            
            // Update movement count
            this.mouseData.movements++;
            
            // Update min/max tracking
            this.mouseData.minX = Math.min(this.mouseData.minX, position.x);
            this.mouseData.maxX = Math.max(this.mouseData.maxX, position.x);
            this.mouseData.minY = Math.min(this.mouseData.minY, position.y);
            this.mouseData.maxY = Math.max(this.mouseData.maxY, position.y);
            
            // Update sums for averaging
            this.mouseData.sumX += position.x;
            this.mouseData.sumY += position.y;
            
            // Calculate time between movements
            if (this.mouseData.lastMovementTime > 0) {
                const timeDiff = timestamp - this.mouseData.lastMovementTime;
                
                if (timeDiff > 0) { // Only record valid time differences
                    this.mouseData.timeBetweenMovements.push(timeDiff);
                    
                    // Update min/max/sum time between
                    this.mouseData.minTimeBetween = Math.min(this.mouseData.minTimeBetween, timeDiff);
                    this.mouseData.maxTimeBetween = Math.max(this.mouseData.maxTimeBetween, timeDiff);
                    this.mouseData.sumTimeBetween += timeDiff;
                }
            }
            this.mouseData.lastMovementTime = timestamp;
            
            // Calculate velocity and angle if we have previous positions
            if (this.mouseData.positions.length > 0) {
                const prevPosition = this.mouseData.positions[this.mouseData.positions.length - 1];
                const prevTimestamp = this.mouseData.timestamps[this.mouseData.timestamps.length - 1];
                
                // Calculate distance
                const dx = position.x - prevPosition.x;
                const dy = position.y - prevPosition.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                // Calculate time delta
                const timeDelta = timestamp - prevTimestamp;
                
                // Calculate velocity in pixels/ms
                if (timeDelta > 0) {
                    const velocity = distance / timeDelta;
                    this.mouseData.velocities.push(velocity);
                    
                    // Update min/max/sum velocity
                    this.mouseData.minVelocity = Math.min(this.mouseData.minVelocity, velocity);
                    this.mouseData.maxVelocity = Math.max(this.mouseData.maxVelocity, velocity);
                    this.mouseData.sumVelocity += velocity;
                }
                
                // Calculate angle in degrees
                if (distance > 0) {
                    const angle = Math.atan2(dy, dx) * 180 / Math.PI;
                    this.mouseData.angles.push(angle);
                    
                    // Update min/max/sum angle (using absolute angle for min/max)
                    const absAngle = Math.abs(angle);
                    this.mouseData.minAngle = Math.min(this.mouseData.minAngle, absAngle);
                    this.mouseData.maxAngle = Math.max(this.mouseData.maxAngle, absAngle);
                    this.mouseData.sumAngle += absAngle;
                }
            }
            
            // Store position and timestamp
            this.mouseData.positions.push(position);
            this.mouseData.timestamps.push(timestamp);
            
            // Cap the arrays to prevent memory issues
            const maxSamples = 100;
            if (this.mouseData.positions.length > maxSamples) {
                this.mouseData.positions.shift();
                this.mouseData.timestamps.shift();
                this.mouseData.velocities.shift();
                this.mouseData.angles.shift();
                this.mouseData.timeBetweenMovements.shift();
            }
        });
    }

    /**
     * Create score indicator visual element - integrates with existing structure
     */
    _createScoreIndicator() {
        try {
            // Get container
            const container = document.getElementById(this.sectionId);
            if (!container) return;
            
            // Find the property list 
            const propertyList = container.querySelector('.property-list');
            if (!propertyList) return;
            
            // Check if our score indicator already exists
            if (container.querySelector('.bot-score-container')) return;
            
            // Create a container for our bot score section
            const scoreContainer = document.createElement('div');
            scoreContainer.className = 'bot-score-container';
            scoreContainer.style.cssText = 'margin: 20px 0; padding: 0;';
            
            // Add it as the first item of the section
            container.insertBefore(scoreContainer, propertyList);
            
            // Create the score circle and display
            const scoreDisplay = document.createElement('div');
            scoreDisplay.style.cssText = 'display: flex; align-items: center; margin-bottom: 15px;';
            
            // Create circle
            const scoreCircle = document.createElement('div');
            scoreCircle.className = 'bot-score-circle';
            scoreCircle.style.cssText = 'width: 70px; height: 70px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background-color: #4CAF50; color: white; font-weight: 600; font-size: 22px; transition: background-color 0.3s ease;';
            
            // Create score text section
            const scoreText = document.createElement('div');
            scoreText.style.cssText = 'margin-left: 15px;';
            
            const statusText = document.createElement('div');
            statusText.className = 'bot-status-text';
            statusText.style.cssText = 'font-size: 20px; font-weight: 600; margin-bottom: 5px; color: #333;';
            
            const description = document.createElement('div');
            description.className = 'bot-description';
            description.style.cssText = 'font-size: 14px; color: #666;';
            
            scoreText.appendChild(statusText);
            scoreText.appendChild(description);
            
            scoreDisplay.appendChild(scoreCircle);
            scoreDisplay.appendChild(scoreText);
            
            // Create score meter
            const scoreMeter = document.createElement('div');
            scoreMeter.style.cssText = 'height: 6px; width: 100%; background-color: #f0f0f0; border-radius: 3px; overflow: hidden; margin-bottom: 15px;';
            
            const scoreBar = document.createElement('div');
            scoreBar.className = 'bot-score-bar';
            scoreBar.style.cssText = 'height: 100%; width: 0%; transition: width 0.5s ease, background-color 0.5s ease;';
            
            scoreMeter.appendChild(scoreBar);
            
            // Add elements to container
            scoreContainer.appendChild(scoreDisplay);
            scoreContainer.appendChild(scoreMeter);
            
            // Style the existing breakdown table - we'll access it but keep it within the property list
            // We'll add styling to this in the update method
            
            // Initial update
            this._updateScoreIndicator();
            
        } catch (e) {
            window.utils.log('Error creating score indicator: ' + e.message, 'error');
        }
    }
    
    /**
     * Update the score indicator based on current detection scores
     */
    _updateScoreIndicator() {
        try {
            const container = document.getElementById(this.sectionId);
            if (!container) return;
            
            // Get our custom elements
            const scoreCircle = container.querySelector('.bot-score-circle');
            const scoreBar = container.querySelector('.bot-score-bar');
            const statusText = container.querySelector('.bot-status-text');
            const description = container.querySelector('.bot-description');
            
            if (!scoreCircle || !scoreBar) return;
            
            // Update score meter
            const score = this.detectionScores.overallScore;
            const scorePercentage = Math.min(score * 100, 100);
            
            // Update the circular score
            scoreCircle.textContent = `${Math.round(scorePercentage)}%`;
            
            // Update bar width
            scoreBar.style.width = `${scorePercentage}%`;
            
            // Set color and status text based on score
            let color, status, descriptionText;
            
            if (score < this.thresholds.humanScoreThreshold) {
                // Green for likely human
                color = '#4CAF50';
                status = 'Likely human';
                descriptionText = 'No suspicious patterns detected';
            } else if (score < this.thresholds.suspiciousScoreThreshold) {
                // Yellow for some unusual patterns
                color = '#FFC107';
                status = 'Some unusual patterns';
                descriptionText = 'Minor anomalies detected, but likely human';
            } else if (score < this.thresholds.botScoreThreshold) {
                // Orange for suspicious
                color = '#FF9800';
                status = 'Suspicious patterns detected';
                descriptionText = 'Several bot-like behaviors observed';
            } else {
                // Red for highly likely bot
                color = '#F44336';
                status = 'Highly likely to be a bot';
                descriptionText = 'Multiple bot signatures detected';
            }
            
            // Apply colors
            scoreBar.style.backgroundColor = color;
            scoreCircle.style.backgroundColor = color;
            
            // Update text
            if (statusText) statusText.textContent = status;
            if (description) description.textContent = descriptionText;
            
            // Style the existing table rows within the property list
            const propertyList = container.querySelector('.property-list');
            if (!propertyList) return;
            
            const rows = propertyList.querySelectorAll('li');
            
            // Create a mapping of property names to factor names for finding the right rows
            const factorMapping = {
                'Mouse Patterns': 'mousePatterns',
                'Headless Browser Detection': 'headlessBrowser',
                'Fake User Agent Detection': 'fakeUserAgent',
                'Unusual Resolution': 'unusualResolution',
                'Remote Desktop (RDP)': 'rdpDetection',
                'Fingerprint Anomalies': 'fingerprinting',
                'API Fingerprint Analysis': 'apiFingerprint'
            };
            
            // Enhance styling for each factor in the breakdown
            rows.forEach(row => {
                const propertyName = row.querySelector('.property-name')?.textContent;
                const valueElement = row.querySelector('.property-value');
                
                if (!propertyName || !valueElement) return;
                
                // Special styling for specific rows
                if (propertyName === 'Score Breakdown') {
                    // Style the breakdown header
                    row.style.marginTop = '20px';
                    valueElement.style.display = 'none'; // Hide the value for the heading
                    
                    const nameElement = row.querySelector('.property-name');
                    if (nameElement) {
                        nameElement.style.fontWeight = '600';
                        nameElement.style.fontSize = '16px';
                        nameElement.style.color = '#333';
                        nameElement.style.borderBottom = '2px solid #e0e0e0';
                        nameElement.style.paddingBottom = '5px';
                        nameElement.style.marginBottom = '5px';
                        nameElement.style.width = '100%';
                    }
                }
                
                // Find the detection factor matching this row
                const factor = factorMapping[propertyName];
                if (factor && this.detectionScores[factor] !== undefined) {
                    const scoreValue = this.detectionScores[factor];
                    
                    // Don't modify the actual content, just enhance the styling
                    if (valueElement) {
                        // Add some color coding based on the score
                        if (scoreValue >= 0.7) {
                            valueElement.style.color = '#D32F2F';
                            valueElement.style.fontWeight = '600';
                        } else if (scoreValue >= 0.4) {
                            valueElement.style.color = '#F57C00';
                            valueElement.style.fontWeight = '600';
                        }
                    }
                }
                
                // Style the overall bot status
                if (propertyName === 'Bot Detection Status') {
                    valueElement.style.fontWeight = '600';
                    
                    if (valueElement.textContent === 'Likely human') {
                        valueElement.style.color = '#4CAF50';
                    } else if (valueElement.textContent === 'Some unusual patterns') {
                        valueElement.style.color = '#FFC107';
                    } else if (valueElement.textContent === 'Suspicious patterns detected') {
                        valueElement.style.color = '#FF9800';
                    } else if (valueElement.textContent === 'Highly likely to be a bot') {
                        valueElement.style.color = '#F44336';
                    }
                }
                
                // Style suspicious patterns
                if (propertyName === 'Suspicious Pattern') {
                    valueElement.style.color = '#FF9800';
                    row.style.backgroundColor = 'rgba(255, 152, 0, 0.05)';
                    row.style.borderLeft = '3px solid #FF9800';
                    row.style.paddingLeft = '10px';
                }
                
                // Style API anomalies
                if (propertyName === 'API Anomalies' && valueElement.textContent !== 'None detected') {
                    valueElement.style.color = '#F57C00';
                    valueElement.style.fontWeight = '600';
                }
                
                // Style API risk score
                if (propertyName === 'API Risk Score' && valueElement.textContent !== '0%') {
                    const riskPercentage = parseFloat(valueElement.textContent);
                    if (riskPercentage >= 70) {
                        valueElement.style.color = '#D32F2F';
                    } else if (riskPercentage >= 40) {
                        valueElement.style.color = '#F57C00';
                    } else if (riskPercentage > 0) {
                        valueElement.style.color = '#FFC107';
                    }
                    valueElement.style.fontWeight = '600';
                }
            });
            
        } catch (e) {
            window.utils.log('Error updating score indicator: ' + e.message, 'error');
        }
    }

    /**
     * Detect fingerprint anomalies that could indicate bots
     */
    _detectFingerprintAnomalies() {
        try {
            let fingerprintScore = 0;
            let anomalies = [];
            
            // Create canvas for fingerprinting
            const canvas = document.createElement('canvas');
            canvas.width = 200;
            canvas.height = 50;
            canvas.style.display = 'none';
            document.body.appendChild(canvas);
            
            const ctx = canvas.getContext('2d');
            
            // Test 1: Check if canvas fingerprinting is blocked
            if (!ctx) {
                anomalies.push('Canvas API is blocked');
                fingerprintScore += 0.5; // Some privacy tools block canvas - moderate indicator
            } else {
                // Draw a unique pattern to generate a fingerprint
                // Background gradient
                const gradient = ctx.createLinearGradient(0, 0, 200, 0);
                gradient.addColorStop(0, "red");
                gradient.addColorStop(1, "blue");
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, 200, 50);
                
                // Draw text
                ctx.fillStyle = "#FFFFFF";
                ctx.font = "16px Arial";
                ctx.fillText("BotCheck " + new Date().getTime(), 10, 30);
                
                // Get fingerprint data
                let fingerprint;
                try {
                    fingerprint = canvas.toDataURL();
                } catch (e) {
                    // If toDataURL throws an error, it's likely a privacy extension
                    anomalies.push('Canvas fingerprinting blocked by privacy extension');
                    fingerprintScore += 0.7; // Strong indicator
                }
                
                if (fingerprint) {
                    // Test for known bot fingerprints or anomalies
                    // Check if fingerprint is too simple or blank
                    if (fingerprint.length < 100) {
                        anomalies.push('Suspicious blank or simple canvas fingerprint');
                        fingerprintScore += 0.8;
                    }
                    
                    // Store the fingerprint hash
                    this.botData.canvasFingerprint = this._simpleHash(fingerprint);
                    
                    // Add to the UI
                    window.utils.addInfo(this.sectionId, 'Canvas Fingerprint Hash', this.botData.canvasFingerprint);
                }
            }
            
            // Test 2: Check WebGL fingerprinting
            const webgl = document.createElement('canvas').getContext('webgl') || 
                          document.createElement('canvas').getContext('experimental-webgl');
            
            if (!webgl) {
                anomalies.push('WebGL is disabled or not available');
                fingerprintScore += 0.4; // Moderate indicator, as some bots disable WebGL
            } else {
                // Get WebGL vendor and renderer
                const vendor = webgl.getParameter(webgl.VENDOR);
                const renderer = webgl.getParameter(webgl.RENDERER);
                
                // Check for virtual machine or suspicious renderers
                const vmKeywords = ['VMware', 'Virtual', 'llvmpipe', 'SwiftShader', 'VirtualBox'];
                const hasVMIndicator = vmKeywords.some(kw => 
                    (vendor && vendor.includes(kw)) || (renderer && renderer.includes(kw))
                );
                
                if (hasVMIndicator) {
                    anomalies.push('VM/Emulated graphics detected');
                    fingerprintScore += 0.6; // Strong indicator of automation
                }
                
                // Store WebGL info
                this.botData.webGLVendor = vendor;
                this.botData.webGLRenderer = renderer;
                
                // Add to the UI
                window.utils.addInfo(this.sectionId, 'WebGL Vendor', vendor || 'Not available');
                window.utils.addInfo(this.sectionId, 'WebGL Renderer', renderer || 'Not available');
            }
            
            // Test 3: Check for consistent/inconsistent fingerprints
            // In a real implementation, you would compare with historical fingerprints
            // Here we'll just do an immediate test for inconsistencies
            if (typeof CanvasRenderingContext2D !== 'undefined' && 
                CanvasRenderingContext2D.prototype.toString().indexOf('native code') === -1) {
                anomalies.push('Canvas API has been modified');
                fingerprintScore += 0.8; // High indicator of tampering
            }
            
            // Clean up
            document.body.removeChild(canvas);
            
            // Update the fingerprinting score (normalize to 0-1)
            this.detectionScores.fingerprinting = Math.min(fingerprintScore, 1.0);
            
            // Report findings
            if (anomalies.length > 0) {
                window.utils.addInfo(this.sectionId, 'Fingerprint Anomalies', anomalies.join(', '));
            }
            
        } catch (e) {
            window.utils.log('Error in fingerprint analysis: ' + e.message, 'error');
        }
    }
    
    /**
     * Simple hash function for fingerprinting
     */
    _simpleHash(str) {
        let hash = 0;
        if (str.length === 0) return hash;
        
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        
        return hash.toString(16); // Return as hex string
    }

    /**
     * Detect anomalies related to browser APIs and event timing
     */
    _detectAPIAnomalies() {
        let riskScore = 0;
        const findings = [];
        let result = 'No API anomalies detected';
        
        try {
            // Get API fingerprint data
            if (!this.apiDetector || !this.apiDetector.apiData) {
                window.utils.log('API detector not initialized or no data available', 'warning');
                return { riskScore, result };
            }
            
            const apiData = this.apiDetector.apiData;
            
            // Check for event timing API anomalies first
            if (apiData.eventTiming && apiData.eventTiming.patterns) {
                const suspiciousPatterns = apiData.eventTiming.patterns || [];
                
                // More conservative scoring based on number and type of patterns
                // Only add significant risk if multiple patterns are found
                if (suspiciousPatterns.length >= 3) {
                    // Multiple anomalies detected - strong bot indicator
                    riskScore += 35;
                    findings.push('Multiple event timing anomalies detected - strong bot indicator');
                } 
                else if (suspiciousPatterns.length === 2) {
                    // Two anomalies - moderate risk
                    riskScore += 20;
                    findings.push('Two event timing anomalies detected - moderate bot risk');
                }
                else if (suspiciousPatterns.length === 1) {
                    // Just one anomaly - low risk
                    riskScore += 10;
                    const patternDescription = suspiciousPatterns[0].includes('Perfect timing') ? 
                        'Perfect timing consistency detected' : 'Unusual event timing pattern';
                    findings.push(`One event timing anomaly detected (${patternDescription}) - possible bot indicator`);
                }
                
                // Look at specific categories of events for more targeted detection
                if (apiData.eventTiming.categorizedEvents) {
                    const categories = apiData.eventTiming.categorizedEvents;
                    
                    // Mouse movement patterns are especially useful for bot detection
                    if (categories.mouse && categories.mouse.length > 20) {
                        // Check if mouse patterns looked suspicious
                        const hasMouseAnomaly = suspiciousPatterns.some(p => 
                            p.toLowerCase().includes('mouse') || p.toLowerCase().includes('pointer')
                        );
                        
                        if (hasMouseAnomaly) {
                            riskScore += 15;
                            findings.push('Suspicious mouse movement patterns detected');
                        }
                    }
                    
                    // Keyboard input patterns
                    if (categories.keyboard && categories.keyboard.length > 10) {
                        const hasKeyboardAnomaly = suspiciousPatterns.some(p => 
                            p.toLowerCase().includes('keyboard') || p.toLowerCase().includes('key')
                        );
                        
                        if (hasKeyboardAnomaly) {
                            riskScore += 15;
                            findings.push('Suspicious keyboard input patterns detected');
                        }
                    }
                }
            }
            
            // Check for other API anomalies
            // ...existing code for other API checks...
            
            // Compile results
            if (findings.length > 0) {
                result = findings.join('; ');
            }
            
            // Update UI with findings
            const botDetectionSection = document.getElementById('bot-detection-info');
            if (botDetectionSection) {
                window.utils.addInfo('bot-detection-info', 'API/Event Anomalies', 
                                    findings.length > 0 ? findings.join('<br>') : 'None detected');
            }
            
        } catch (e) {
            window.utils.log('Error detecting API anomalies: ' + e.message, 'error');
        }
        
        return { riskScore, result };
    }

    /**
     * Calculate the overall bot risk score based on various detection methods
     */
    _calculateRiskScore() {
        let totalScore = 0;
        const scoreDetails = {};
        
        try {
            // For tracking individual scoring components
            let behaviorScore = 0;
            let fingerprintScore = 0;
            let apiAnomalyScore = 0;
            
            // Check fingerprinting anomalies
            const fingerprintResult = this._detectFingerprintAnomalies();
            fingerprintScore = fingerprintResult.riskScore;
            scoreDetails.fingerprint = {
                score: fingerprintScore,
                details: fingerprintResult.result
            };
            
            // Check behavior anomalies
            const behaviorResult = this._detectBehaviorAnomalies();
            behaviorScore = behaviorResult.riskScore;
            scoreDetails.behavior = {
                score: behaviorScore,
                details: behaviorResult.result
            };
            
            // Check API anomalies including event timing
            const apiResult = this._detectAPIAnomalies();
            apiAnomalyScore = apiResult.riskScore;
            scoreDetails.api = {
                score: apiAnomalyScore,
                details: apiResult.result
            };
            
            // Normalize scores to 0-100 scale
            totalScore = Math.min(
                (fingerprintScore + behaviorScore + apiAnomalyScore) / 3 * 100, 
                100
            );
            
            // Round to 1 decimal place
            totalScore = Math.round(totalScore * 10) / 10;
            
            // Categorize the risk
            let riskLevel = 'Low';
            if (totalScore >= 75) {
                riskLevel = 'Very High';
            } else if (totalScore >= 60) {
                riskLevel = 'High';
            } else if (totalScore >= 40) {
                riskLevel = 'Medium';
            } else if (totalScore >= 20) {
                riskLevel = 'Low-Medium';
            }
            
            // Update UI
            window.utils.addInfo(this.sectionId, 'Bot Risk Score', `${totalScore}%`, 
                                totalScore > 60 ? 'warning-indicator' : '');
            window.utils.addInfo(this.sectionId, 'Risk Level', riskLevel,
                                totalScore > 60 ? 'warning-indicator' : '');
            
            // Display score breakdown
            window.utils.addInfo(this.sectionId, 'Fingerprint Anomalies Score', 
                                `${Math.round(fingerprintScore * 100)}%`);
            window.utils.addInfo(this.sectionId, 'Behavior Anomalies Score', 
                                `${Math.round(behaviorScore * 100)}%`);
            window.utils.addInfo(this.sectionId, 'API/Event Timing Score', 
                                `${Math.round(apiAnomalyScore * 100)}%`);
            
            // Store for later reference
            this.botScore = totalScore;
            this.scoreDetails = scoreDetails;
            
            return totalScore;
        } catch (e) {
            window.utils.log('Error calculating risk score: ' + e.message, 'error');
            return 0;
        }
    }

    /**
     * Update UI with detection results
     */
    _updateUI() {
        try {
            // Calculate the overall bot score percentage
            const botScorePercentage = Math.round(this.detectionScores.overallScore * 100);
            
            // Create a visually appealing score indicator
            const scoreContainer = document.createElement('div');
            scoreContainer.className = 'score-indicator';
            
            // Determine color based on score
            let scoreClass = 'score-low';
            let statusText = 'Likely human';
            
            if (botScorePercentage > 70) {
                scoreClass = 'score-high';
                statusText = 'Likely bot';
            } else if (botScorePercentage > 30) {
                scoreClass = 'score-medium';
                statusText = 'Suspicious behavior';
            }
            
            // Create the circular progress indicator
            const scoreCircle = document.createElement('div');
            scoreCircle.className = `score-circle ${scoreClass}`;
            scoreCircle.textContent = `${botScorePercentage}%`;
            scoreContainer.appendChild(scoreCircle);
            
            // Create text content
            const scoreText = document.createElement('div');
            scoreText.className = 'score-text';
            
            const scoreLabel = document.createElement('div');
            scoreLabel.className = 'score-label';
            scoreLabel.textContent = statusText;
            scoreText.appendChild(scoreLabel);
            
            const scoreDescription = document.createElement('div');
            scoreDescription.className = 'score-description';
            scoreDescription.textContent = this._getSuspiciousFactors();
            scoreText.appendChild(scoreDescription);
            
            scoreContainer.appendChild(scoreText);
            
            // Add the score indicator to the section
            const botSection = document.getElementById(this.sectionId);
            if (botSection) {
                // Check if we already have a score indicator
                const existingIndicator = botSection.querySelector('.score-indicator');
                if (existingIndicator) {
                    existingIndicator.replaceWith(scoreContainer);
                } else {
                    // Add it at the top
                    if (botSection.firstChild) {
                        botSection.insertBefore(scoreContainer, botSection.firstChild);
                    } else {
                        botSection.appendChild(scoreContainer);
                    }
                }
            }
            
            // Update individual detection scores
            this._updateDetectionScores();
        } catch (e) {
            window.utils.log('Error updating bot detection UI: ' + e.message, 'error');
        }
    }

    /**
     * Get a text summary of suspicious factors
     * @returns {string} Summary of suspicious factors
     */
    _getSuspiciousFactors() {
        const suspiciousFactors = [];
        
        if (this.detectionScores.mousePatterns > 0.5) {
            suspiciousFactors.push('unusual mouse patterns');
        }
        
        if (this.detectionScores.headlessBrowser > 0.5) {
            suspiciousFactors.push('headless browser indicators');
        }
        
        if (this.detectionScores.fakeUserAgent > 0.5) {
            suspiciousFactors.push('user agent inconsistencies');
        }
        
        if (this.detectionScores.unusualResolution > 0.5) {
            suspiciousFactors.push('unusual screen resolution');
        }
        
        if (this.detectionScores.rdpDetection > 0.5) {
            suspiciousFactors.push('remote desktop detected');
        }
        
        if (this.detectionScores.fingerprinting > 0.5) {
            suspiciousFactors.push('fingerprint anomalies');
        }
        
        if (this.detectionScores.apiFingerprint > 0.5) {
            suspiciousFactors.push('API behavioral anomalies');
        }
        
        if (this.detectionScores.eventTimingPatterns > 0.5) {
            suspiciousFactors.push('unnatural timing patterns');
        }
        
        if (suspiciousFactors.length === 0) {
            return 'No suspicious patterns detected';
        } else {
            return 'Detected: ' + suspiciousFactors.join(', ');
        }
    }
}

// Export the detector
window.BotDetector = BotDetector; 