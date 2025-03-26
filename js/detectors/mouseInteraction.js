/**
 * Enhanced Mouse Interaction Detector
 * Tracks and analyzes mouse movement patterns with remote access detection
 */

class MouseInteractionDetector {
    constructor() {
        this.sectionId = 'interaction-info';
        this.sectionTitle = 'Mouse Interaction';
        this.interactionData = {};
        
        // Mouse tracking data
        this.mouseData = {
            movements: 0,
            clicks: 0,
            scrollEvents: 0,
            // Position tracking
            positions: [],
            timestamps: [],
            minX: Infinity,
            maxX: -Infinity,
            minY: Infinity,
            maxY: -Infinity,
            sumX: 0,
            sumY: 0,
            // Movement speed tracking
            velocities: [],
            minVelocity: Infinity,
            maxVelocity: -Infinity,
            sumVelocity: 0,
            // Time between movements
            lastMovementTime: 0,
            timeBetweenMovements: [],
            minTimeBetween: Infinity,
            maxTimeBetween: -Infinity,
            sumTimeBetween: 0,
            // Track mouse presence in viewport
            isMouseInViewport: false,
            mouseEntryCount: 0,
            mouseExitCount: 0,
            timeInViewport: 0,
            viewportEntryTime: 0,
            // Remote detection metrics
            straightLineSegments: 0,
            curvedLineSegments: 0,
            velocityConsistencyScores: [],
            accelerationPatterns: [],
            movementAngles: [],
            // Suspicion score (0-100)
            remoteAccessScore: 0,
            remoteSuspicionReasons: []
        };
    }

    /**
     * Start mouse interaction detection
     */
    detect() {
        this._createSection();
        this._setupMouseTracking();
        
        // Add initial status message to make the tab content visible immediately
        window.utils.addInfo(this.sectionId, 'Status', 'Waiting for mouse movement...');
        window.utils.addInfo(this.sectionId, 'Mouse Events', '0');
        window.utils.addInfo(this.sectionId, 'How to Test', 'Move your mouse around the page to generate interaction data.');
        
        // Create a visualization area
        const section = document.getElementById(this.sectionId);
        if (section) {
            const visualArea = document.createElement('div');
            visualArea.id = 'mouse-visualization';
            visualArea.innerHTML = `
                <h3>Mouse Movement Visualization</h3>
                <div class="visualization-container">
                    <canvas id="mouse-movement-canvas" width="400" height="200"></canvas>
                </div>
                <div id="remote-detection-indicator" class="remote-detection">
                    <h4>Remote Access Detection</h4>
                    <div class="progress-container">
                        <div id="remote-score-bar" class="progress-bar" style="width: 0%"></div>
                    </div>
                    <div id="remote-score-value">Score: 0/100</div>
                    <div id="remote-detection-reasons"></div>
                </div>
                <p class="visualization-help">Your mouse movements will be tracked and displayed above.</p>
            `;
            section.appendChild(visualArea);
            
            // Add CSS for the remote detection indicator
            const style = document.createElement('style');
            style.textContent = `
                .remote-detection { margin-top: 15px; padding: 10px; border: 1px solid #ddd; border-radius: 4px; }
                .remote-detection h4 { margin-top: 0; margin-bottom: 10px; }
                .progress-container { width: 100%; background-color: #f1f1f1; border-radius: 3px; }
                .progress-bar { height: 24px; border-radius: 3px; }
                #remote-score-bar { background-color: #4CAF50; transition: width 0.5s ease-in-out; }
                #remote-score-value { margin-top: 5px; font-weight: bold; }
                #remote-detection-reasons { margin-top: 10px; font-size: 0.9em; }
            `;
            document.head.appendChild(style);
            
            // Initialize canvas visualization
            this._initializeCanvas();
        }
        
        // Setup interval to update UI
        setInterval(() => this._updateInteractionResults(), 1000);
        
        return this.interactionData;
    }

    /**
     * Create the mouse interaction section in the DOM
     */
    _createSection() {
        if (window.utils && window.utils.log) {
            window.utils.log('Creating mouse interaction section', 'info');
        } else {
            console.log('Creating mouse interaction section');
        }
        
        return window.utils.createInfoSection(this.sectionId, this.sectionTitle);
    }

    /**
     * Setup mouse event tracking
     */
    _setupMouseTracking() {
        // Track mouse movement
        document.addEventListener('mousemove', (e) => {
            const timestamp = Date.now();
            const position = { x: e.clientX, y: e.clientY };
            
            // Skip if position hasn't changed (can happen with remote desktop)
            if (this.mouseData.positions.length > 0) {
                const lastPos = this.mouseData.positions[this.mouseData.positions.length - 1];
                if (lastPos.x === position.x && lastPos.y === position.y) {
                    return;
                }
            }
            
            // Update movement count
            this.mouseData.movements++;
            
            // Update position statistics
            this.mouseData.minX = Math.min(this.mouseData.minX, position.x);
            this.mouseData.maxX = Math.max(this.mouseData.maxX, position.x);
            this.mouseData.minY = Math.min(this.mouseData.minY, position.y);
            this.mouseData.maxY = Math.max(this.mouseData.maxY, position.y);
            this.mouseData.sumX += position.x;
            this.mouseData.sumY += position.y;
            
            // Calculate time between movements
            if (this.mouseData.lastMovementTime > 0) {
                const timeDiff = timestamp - this.mouseData.lastMovementTime;
                
                // Remote desktop often has a very consistent timing pattern
                if (timeDiff > 0) {
                    this.mouseData.timeBetweenMovements.push(timeDiff);
                    
                    // Update time statistics
                    this.mouseData.minTimeBetween = Math.min(this.mouseData.minTimeBetween, timeDiff);
                    this.mouseData.maxTimeBetween = Math.max(this.mouseData.maxTimeBetween, timeDiff);
                    this.mouseData.sumTimeBetween += timeDiff;
                }
            }
            this.mouseData.lastMovementTime = timestamp;
            
            // Calculate velocity and analyze movement patterns
            if (this.mouseData.positions.length > 0) {
                const prevPosition = this.mouseData.positions[this.mouseData.positions.length - 1];
                const prevTimestamp = this.mouseData.timestamps[this.mouseData.timestamps.length - 1];
                
                // Calculate distance
                const dx = position.x - prevPosition.x;
                const dy = position.y - prevPosition.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                // Calculate movement angle (in degrees)
                const angle = Math.atan2(dy, dx) * 180 / Math.PI;
                this.mouseData.movementAngles.push(angle);
                
                // Calculate time delta
                const timeDelta = timestamp - prevTimestamp;
                
                // Calculate velocity in pixels/ms
                if (timeDelta > 0) {
                    const velocity = distance / timeDelta;
                    this.mouseData.velocities.push(velocity);
                    
                    // Update velocity statistics
                    this.mouseData.minVelocity = Math.min(this.mouseData.minVelocity, velocity);
                    this.mouseData.maxVelocity = Math.max(this.mouseData.maxVelocity, velocity);
                    this.mouseData.sumVelocity += velocity;
                    
                    // Calculate acceleration if we have at least 2 velocities
                    if (this.mouseData.velocities.length > 1) {
                        const prevVelocity = this.mouseData.velocities[this.mouseData.velocities.length - 2];
                        const acceleration = (velocity - prevVelocity) / timeDelta;
                        this.mouseData.accelerationPatterns.push(acceleration);
                    }
                    
                    // Calculate velocity consistency score
                    if (this.mouseData.velocities.length > 2) {
                        const velocityHistory = this.mouseData.velocities.slice(-3);
                        const avgVelocity = velocityHistory.reduce((sum, v) => sum + v, 0) / velocityHistory.length;
                        const velocityVariance = velocityHistory.reduce((sum, v) => sum + Math.pow(v - avgVelocity, 2), 0) / velocityHistory.length;
                        
                        // Normalize to a 0-1 scale (1 = perfectly consistent, 0 = highly variable)
                        const consistencyScore = Math.exp(-10 * velocityVariance);
                        this.mouseData.velocityConsistencyScores.push(consistencyScore);
                    }
                }
                
                // Detect straight line segments (remote desktop users often move in straight lines)
                if (this.mouseData.positions.length > 2) {
                    const p1 = this.mouseData.positions[this.mouseData.positions.length - 3];
                    const p2 = this.mouseData.positions[this.mouseData.positions.length - 2];
                    const p3 = position;
                    
                    // Check if points are nearly collinear (on a straight line)
                    // Using the area of the triangle formed by the three points
                    const area = Math.abs((p1.x * (p2.y - p3.y) + p2.x * (p3.y - p1.y) + p3.x * (p1.y - p2.y)) / 2);
                    const distance12 = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
                    const distance23 = Math.sqrt(Math.pow(p3.x - p2.x, 2) + Math.pow(p3.y - p2.y, 2));
                    const distanceThreshold = Math.max(distance12, distance23) * 0.1; // Adjust threshold based on distance
                    
                    if (area < distanceThreshold) {
                        this.mouseData.straightLineSegments++;
                    } else {
                        this.mouseData.curvedLineSegments++;
                    }
                }
            }
            
            // Store position and timestamp
            this.mouseData.positions.push(position);
            this.mouseData.timestamps.push(timestamp);
            
            // Cap arrays to prevent memory issues
            const maxSamples = 200; // Increased from 100 for better pattern detection
            if (this.mouseData.positions.length > maxSamples) {
                this.mouseData.positions.shift();
                this.mouseData.timestamps.shift();
                if (this.mouseData.velocities.length > maxSamples) this.mouseData.velocities.shift();
                if (this.mouseData.timeBetweenMovements.length > maxSamples) this.mouseData.timeBetweenMovements.shift();
                if (this.mouseData.velocityConsistencyScores.length > maxSamples) this.mouseData.velocityConsistencyScores.shift();
                if (this.mouseData.accelerationPatterns.length > maxSamples) this.mouseData.accelerationPatterns.shift();
                if (this.mouseData.movementAngles.length > maxSamples) this.mouseData.movementAngles.shift();
            }
            
            // Mark mouse as in viewport
            if (!this.mouseData.isMouseInViewport) {
                this.mouseData.isMouseInViewport = true;
                this.mouseData.mouseEntryCount++;
                this.mouseData.viewportEntryTime = Date.now();
            }
            
            // Detect remote access patterns every 10 movements
            if (this.mouseData.movements % 10 === 0 && this.mouseData.movements > 20) {
                this._analyzeRemoteAccessPatterns();
            }
        });
        
        // Track mouse clicks
        document.addEventListener('click', () => {
            this.mouseData.clicks++;
        });
        
        // Track scroll events
        document.addEventListener('wheel', () => {
            this.mouseData.scrollEvents++;
        });
        
        // Track mouse leaving viewport
        document.addEventListener('mouseout', (e) => {
            // Check if mouse has actually left the viewport (and not just moved to a child element)
            if (!e.relatedTarget || e.relatedTarget.nodeName === 'HTML') {
                if (this.mouseData.isMouseInViewport) {
                    this.mouseData.isMouseInViewport = false;
                    this.mouseData.mouseExitCount++;
                    
                    // Update time spent in viewport
                    if (this.mouseData.viewportEntryTime > 0) {
                        this.mouseData.timeInViewport += (Date.now() - this.mouseData.viewportEntryTime);
                    }
                }
            }
        });
    }

    /**
     * Analyze mouse patterns to detect remote access
     */
    _analyzeRemoteAccessPatterns() {
        const reasons = [];
        let score = 0;
        
        // Only analyze if we have enough data
        if (this.mouseData.movements < 20) return;
        
        // 1. Straight line ratio analysis
        const totalSegments = this.mouseData.straightLineSegments + this.mouseData.curvedLineSegments;
        if (totalSegments > 10) {
            const straightLineRatio = this.mouseData.straightLineSegments / totalSegments;
            
            // Remote access tends to have more straight lines
            if (straightLineRatio > 0.8) {
                score += 25;
                reasons.push(`Unusually high straight-line movement (${(straightLineRatio * 100).toFixed(1)}%)`);
            } else if (straightLineRatio > 0.65) {
                score += 15;
                reasons.push(`Elevated straight-line movement (${(straightLineRatio * 100).toFixed(1)}%)`);
            }
        }
        
        // 2. Velocity consistency analysis
        if (this.mouseData.velocityConsistencyScores.length > 10) {
            const avgConsistency = this.mouseData.velocityConsistencyScores.reduce((sum, score) => sum + score, 0) / 
                this.mouseData.velocityConsistencyScores.length;
            
            // Remote access tends to have unnatural consistency
            if (avgConsistency > 0.9) {
                score += 25;
                reasons.push(`Unusually consistent movement velocity (${(avgConsistency * 100).toFixed(1)}%)`);
            } else if (avgConsistency > 0.8) {
                score += 15;
                reasons.push(`Elevated movement velocity consistency (${(avgConsistency * 100).toFixed(1)}%)`);
            }
        }
        
        // 3. Movement timing analysis
        if (this.mouseData.timeBetweenMovements.length > 10) {
            // Calculate standard deviation of time between movements
            const avg = this.mouseData.sumTimeBetween / this.mouseData.timeBetweenMovements.length;
            const variance = this.mouseData.timeBetweenMovements.reduce((sum, time) => sum + Math.pow(time - avg, 2), 0) / 
                this.mouseData.timeBetweenMovements.length;
            const stdDev = Math.sqrt(variance);
            
            // Remote desktop often has suspiciously consistent timing
            const consistencyRatio = stdDev / avg;
            if (consistencyRatio < 0.2) {
                score += 20;
                reasons.push(`Unusually consistent timing between movements`);
            } else if (consistencyRatio < 0.4) {
                score += 10;
                reasons.push(`Somewhat consistent timing between movements`);
            }
            
            // Remote desktop often has higher latency
            if (avg > 30) {
                score += 10;
                reasons.push(`Elevated movement latency (${avg.toFixed(1)}ms)`);
            }
        }
        
        // 4. Angle pattern analysis (look for angular movement)
        if (this.mouseData.movementAngles.length > 10) {
            // Calculate how many angles are close to 0, 90, 180, or 270 degrees
            const isCardinalAngle = (angle) => {
                const normalized = ((angle % 360) + 360) % 360; // Normalize to 0-360
                return [0, 90, 180, 270].some(cardinal => 
                    Math.abs(normalized - cardinal) < 5 || Math.abs(normalized - cardinal - 360) < 5);
            };
            
            const cardinalCount = this.mouseData.movementAngles.filter(isCardinalAngle).length;
            const cardinalRatio = cardinalCount / this.mouseData.movementAngles.length;
            
            if (cardinalRatio > 0.4) {
                score += 15;
                reasons.push(`High percentage of cardinal direction movements (${(cardinalRatio * 100).toFixed(1)}%)`);
            }
        }
        
        // 5. Check for unnatural acceleration patterns
        if (this.mouseData.accelerationPatterns.length > 10) {
            // Human movement has natural acceleration/deceleration
            // Remote often has more abrupt changes
            const abruptChanges = this.mouseData.accelerationPatterns.filter(acc => Math.abs(acc) > 0.05).length;
            const abruptRatio = abruptChanges / this.mouseData.accelerationPatterns.length;
            
            if (abruptRatio > 0.6) {
                score += 15;
                reasons.push(`Unnatural acceleration pattern detected`);
            }
        }
        
        // Cap score at 100
        this.mouseData.remoteAccessScore = Math.min(100, score);
        this.mouseData.remoteSuspicionReasons = reasons;
    }

    /**
     * Initialize the canvas for visualizing mouse movements
     */
    _initializeCanvas() {
        const canvas = document.getElementById('mouse-movement-canvas');
        if (!canvas) return;
        
        // Set canvas size to match container
        const container = canvas.parentElement;
        if (container) {
            canvas.width = container.clientWidth;
            canvas.height = container.clientHeight || 200;
        }
        
        // Draw background
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.fillStyle = '#f9f9f9';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Draw instructions
            ctx.fillStyle = '#aaa';
            ctx.font = '14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Move your mouse to see the interaction pattern', canvas.width / 2, canvas.height / 2);
        }
        
        // Setup visualization update
        this._lastDrawnMovementCount = 0;
        setInterval(() => this._updateVisualization(), 100);
    }
    
    /**
     * Update the mouse movement visualization
     */
    _updateVisualization() {
        const canvas = document.getElementById('mouse-movement-canvas');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        // Only redraw if there are new movements
        if (this._lastDrawnMovementCount === this.mouseData.movements) {
            // Still update remote detection indicator even if no new movements
            this._updateRemoteDetectionIndicator();
            return;
        }
        this._lastDrawnMovementCount = this.mouseData.movements;
        
        // Clear canvas
        ctx.fillStyle = '#f9f9f9';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw movement path
        if (this.mouseData.positions.length > 1) {
            ctx.beginPath();
            ctx.strokeStyle = '#3498db';
            ctx.lineWidth = 2;
            
            // Calculate scaling to fit all points in the canvas
            const xScale = canvas.width / (this.mouseData.maxX - this.mouseData.minX || 1);
            const yScale = canvas.height / (this.mouseData.maxY - this.mouseData.minY || 1);
            const scale = Math.min(xScale, yScale) * 0.8;
            
            // Calculate offset to center the path
            const xOffset = (canvas.width / 2) - ((this.mouseData.maxX + this.mouseData.minX) / 2 * scale);
            const yOffset = (canvas.height / 2) - ((this.mouseData.maxY + this.mouseData.minY) / 2 * scale);
            
            // Draw path with color gradient based on velocity
            for (let i = 1; i < this.mouseData.positions.length; i++) {
                const pos1 = this.mouseData.positions[i-1];
                const pos2 = this.mouseData.positions[i];
                
                // Color based on velocity (if available)
                if (i < this.mouseData.velocities.length) {
                    const normalizedVelocity = Math.min(1, this.mouseData.velocities[i] / (this.mouseData.maxVelocity || 1));
                    // Color gradient: blue (slow) to red (fast)
                    const r = Math.round(normalizedVelocity * 255);
                    const g = Math.round(100 * (1 - normalizedVelocity));
                    const b = Math.round(255 * (1 - normalizedVelocity));
                    ctx.strokeStyle = `rgb(${r},${g},${b})`;
                }
                
                ctx.beginPath();
                ctx.moveTo(pos1.x * scale + xOffset, pos1.y * scale + yOffset);
                ctx.lineTo(pos2.x * scale + xOffset, pos2.y * scale + yOffset);
                ctx.stroke();
            }
            
            // Draw points
            ctx.fillStyle = '#2980b9';
            for (let i = 0; i < this.mouseData.positions.length; i++) {
                const pos = this.mouseData.positions[i];
                ctx.beginPath();
                ctx.arc(pos.x * scale + xOffset, pos.y * scale + yOffset, 3, 0, Math.PI * 2);
                ctx.fill();
            }
            
            // Highlight straight line segments
            if (this.mouseData.straightLineSegments > 0) {
                for (let i = 2; i < this.mouseData.positions.length; i++) {
                    const p1 = this.mouseData.positions[i-2];
                    const p2 = this.mouseData.positions[i-1];
                    const p3 = this.mouseData.positions[i];
                    
                    // Recalculate if this is a straight line segment
                    const area = Math.abs((p1.x * (p2.y - p3.y) + p2.x * (p3.y - p1.y) + p3.x * (p1.y - p2.y)) / 2);
                    const distance12 = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
                    const distance23 = Math.sqrt(Math.pow(p3.x - p2.x, 2) + Math.pow(p3.y - p2.y, 2));
                    const distanceThreshold = Math.max(distance12, distance23) * 0.1;
                    
                    if (area < distanceThreshold) {
                        // Draw a highlight for straight line segments
                        ctx.beginPath();
                        ctx.strokeStyle = 'rgba(255, 0, 0, 0.3)';
                        ctx.lineWidth = 5;
                        ctx.moveTo(p1.x * scale + xOffset, p1.y * scale + yOffset);
                        ctx.lineTo(p3.x * scale + xOffset, p3.y * scale + yOffset);
                        ctx.stroke();
                    }
                }
            }
        } else {
            // Draw instructions if no movement
            ctx.fillStyle = '#aaa';
            ctx.font = '14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Move your mouse to see the interaction pattern', canvas.width / 2, canvas.height / 2);
        }
        
        // Update remote detection indicator
        this._updateRemoteDetectionIndicator();
    }
    
    /**
     * Update the remote detection indicator
     */
    _updateRemoteDetectionIndicator() {
        const scoreBar = document.getElementById('remote-score-bar');
        const scoreValue = document.getElementById('remote-score-value');
        const reasonsElement = document.getElementById('remote-detection-reasons');
        
        if (!scoreBar || !scoreValue || !reasonsElement) return;
        
        // Update score bar width
        scoreBar.style.width = `${this.mouseData.remoteAccessScore}%`;
        
        // Update color based on score
        if (this.mouseData.remoteAccessScore < 30) {
            scoreBar.style.backgroundColor = '#4CAF50'; // Green
        } else if (this.mouseData.remoteAccessScore < 60) {
            scoreBar.style.backgroundColor = '#FFC107'; // Yellow/Amber
        } else {
            scoreBar.style.backgroundColor = '#F44336'; // Red
        }
        
        // Update score text
        scoreValue.textContent = `Score: ${this.mouseData.remoteAccessScore}/100`;
        
        // Update reasons
        if (this.mouseData.remoteSuspicionReasons.length > 0) {
            reasonsElement.innerHTML = '<strong>Suspicious patterns:</strong><ul>' + 
                this.mouseData.remoteSuspicionReasons.map(reason => `<li>${reason}</li>`).join('') + 
                '</ul>';
        } else if (this.mouseData.movements > 20) {
            reasonsElement.textContent = 'No suspicious patterns detected.';
        } else {
            reasonsElement.textContent = 'Need more mouse movement data for analysis.';
        }
    }

    /**
     * Update interaction metrics in the UI
     */
    _updateInteractionResults() {
        // Only start updating once we have some movement data
        if (this.mouseData.movements === 0) {
            window.utils.addInfo(this.sectionId, 'Status', 'Waiting for mouse movement...');
            return;
        }
        
        // Basic interaction metrics
        window.utils.addInfo(this.sectionId, 'Mouse Movements', this.mouseData.movements);
        window.utils.addInfo(this.sectionId, 'Mouse Clicks', this.mouseData.clicks);
        window.utils.addInfo(this.sectionId, 'Scroll Events', this.mouseData.scrollEvents);
        
        // Mouse position range
        window.utils.addInfo(this.sectionId, 'Position Range X', 
            `${Math.round(this.mouseData.minX)} to ${Math.round(this.mouseData.maxX)} pixels`);
        window.utils.addInfo(this.sectionId, 'Position Range Y', 
            `${Math.round(this.mouseData.minY)} to ${Math.round(this.mouseData.maxY)} pixels`);
        
        // Average position
        if (this.mouseData.movements > 0) {
            const avgX = this.mouseData.sumX / this.mouseData.movements;
            const avgY = this.mouseData.sumY / this.mouseData.movements;
            window.utils.addInfo(this.sectionId, 'Average Position', 
                `X: ${Math.round(avgX)}, Y: ${Math.round(avgY)} pixels`);
        }
        
        // Velocity statistics
        if (this.mouseData.velocities.length > 0) {
            const avgVelocity = this.mouseData.sumVelocity / this.mouseData.velocities.length;
            window.utils.addInfo(this.sectionId, 'Mouse Velocity (px/ms)', 
                `Min: ${this.mouseData.minVelocity.toFixed(3)}, Max: ${this.mouseData.maxVelocity.toFixed(3)}, Avg: ${avgVelocity.toFixed(3)}`);
        }
        
        // Time between movements
        if (this.mouseData.timeBetweenMovements.length > 0) {
            const avgTimeBetween = this.mouseData.sumTimeBetween / this.mouseData.timeBetweenMovements.length;
            window.utils.addInfo(this.sectionId, 'Time Between Movements (ms)', 
                `Min: ${this.mouseData.minTimeBetween}, Max: ${this.mouseData.maxTimeBetween}, Avg: ${avgTimeBetween.toFixed(2)}`);
        }
        
        // Viewport entry/exit
        window.utils.addInfo(this.sectionId, 'Mouse In Viewport', this.mouseData.isMouseInViewport ? 'Yes' : 'No');
        window.utils.addInfo(this.sectionId, 'Viewport Entries', this.mouseData.mouseEntryCount);
        window.utils.addInfo(this.sectionId, 'Viewport Exits', this.mouseData.mouseExitCount);
        
        // Time in viewport
        let timeInViewport = this.mouseData.timeInViewport;
        if (this.mouseData.isMouseInViewport && this.mouseData.viewportEntryTime > 0) {
            timeInViewport += (Date.now() - this.mouseData.viewportEntryTime);
        }
        window.utils.addInfo(this.sectionId, 'Time in Viewport', 
            `${Math.round(timeInViewport / 1000)} seconds`);
        
        // Remote detection metrics
        if (this.mouseData.movements > 20) {
            window.utils.addInfo(this.sectionId, 'Remote Access Detection', 
                `Score: ${this.mouseData.remoteAccessScore}/100 ${this.mouseData.remoteAccessScore > 50 ? '⚠️' : ''}`);
            
            // Line segment analysis
            const totalSegments = this.mouseData.straightLineSegments + this.mouseData.curvedLineSegments;
            if (totalSegments > 0) {
                const straightLineRatio = this.mouseData.straightLineSegments / totalSegments;
                window.utils.addInfo(this.sectionId, 'Straight Line Segments', 
                    `${this.mouseData.straightLineSegments}/${totalSegments} (${(straightLineRatio * 100).toFixed(1)}%)`);
            }
            
            // Velocity consistency
            if (this.mouseData.velocityConsistencyScores.length > 0) {
                const avgConsistency = this.mouseData.velocityConsistencyScores.reduce((sum, score) => sum + score, 0) / 
                    this.mouseData.velocityConsistencyScores.length;
                window.utils.addInfo(this.sectionId, 'Velocity Consistency', 
                    `${(avgConsistency * 100).toFixed(1)}% ${avgConsistency > 0.8 ? '⚠️' : ''}`);
            }
            
            // Movement angle patterns
            if (this.mouseData.movementAngles.length > 10) {
                // Calculate how many angles are close to 0, 90, 180, or 270 degrees
                const isCardinalAngle = (angle) => {
                    const normalized = ((angle % 360) + 360) % 360; // Normalize to 0-360
                    return [0, 90, 180, 270].some(cardinal => 
                        Math.abs(normalized - cardinal) < 5 || Math.abs(normalized - cardinal - 360) < 5);
                };
                
                const cardinalCount = this.mouseData.movementAngles.filter(isCardinalAngle).length;
                const cardinalRatio = cardinalCount / this.mouseData.movementAngles.length;
                
                window.utils.addInfo(this.sectionId, 'Cardinal Direction Movements', 
                    `${(cardinalRatio * 100).toFixed(1)}% ${cardinalRatio > 0.4 ? '⚠️' : ''}`);
            }
        }
    }
    
    /**
     * Get remote access detection results
     * @returns {Object} Remote access detection results
     */
    getRemoteAccessResults() {
        return {
            score: this.mouseData.remoteAccessScore,
            isLikelyRemote: this.mouseData.remoteAccessScore > 60,
            possiblyRemote: this.mouseData.remoteAccessScore > 30,
            reasons: this.mouseData.remoteSuspicionReasons,
            stats: {
                straightLineRatio: this.mouseData.straightLineSegments / 
                    (this.mouseData.straightLineSegments + this.mouseData.curvedLineSegments || 1),
                velocityConsistency: this.mouseData.velocityConsistencyScores.length ? 
                    (this.mouseData.velocityConsistencyScores.reduce((sum, score) => sum + score, 0) / 
                    this.mouseData.velocityConsistencyScores.length) : 0,
                avgLatency: this.mouseData.timeBetweenMovements.length ? 
                    (this.mouseData.sumTimeBetween / this.mouseData.timeBetweenMovements.length) : 0
            }
        };
    }
}

// Export the detector
window.MouseInteractionDetector = MouseInteractionDetector;