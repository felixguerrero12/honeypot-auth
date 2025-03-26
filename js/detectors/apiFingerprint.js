/**
 * API Fingerprinting Module
 * Uses various browser APIs to gather fingerprinting data and detect suspicious behavior
 * Includes: Performance API, Device Memory API, Web Audio API, Battery API, and more
 */

class APIFingerprintDetector {
    constructor() {
        window.utils.log('APIFingerprintDetector constructor called', 'info');
        this.sectionId = 'api-fingerprint-info';
        this.sectionTitle = 'API Fingerprint';
        this.apiData = {};
        
        // Results for different API tests
        this.results = {
            performance: {},
            memory: {},
            audio: {},
            battery: {},
            suspicious: [],
            eventTiming: {}
        };
        
        // Flag to control event monitoring duration
        this.monitorDuration = 5000; // 5 seconds in milliseconds
        this.monitoringActive = false;
        
        window.utils.log(`APIFingerprintDetector initialized with sectionId: ${this.sectionId}`, 'info');
    }

    /**
     * Start API fingerprinting detection
     */
    detect() {
        window.utils.log('APIFingerprintDetector.detect() method called', 'info');
        
        const section = this._createSection();
        window.utils.log(`Section created with ID: ${section ? section.id : 'unknown'}`, 'info');
        
        // Run all API tests
        window.utils.log('Starting Performance API detection', 'info');
        this._detectPerformanceAPI();
        
        window.utils.log('Starting Event Timing API detection', 'info');
        this._detectPerformanceEventTiming();
        
        window.utils.log('Starting Device Memory API detection', 'info');
        this._detectDeviceMemoryAPI();
        
        window.utils.log('Starting Audio API detection', 'info');
        this._detectAudioAPI();
        
        window.utils.log('Starting Battery API detection', 'info');
        this._detectBatteryAPI();
        
        window.utils.log('Starting Suspicious APIs detection', 'info');
        this._detectSuspiciousAPIs();
        
        // Add summary information
        window.utils.log('Adding fingerprint summary', 'info');
        this._addFingerprintSummary();
        
        window.utils.log('API Fingerprint detection completed', 'info');
        return this.apiData;
    }

    /**
     * Create the API fingerprinting section in the DOM
     */
    _createSection() {
        try {
            window.utils.log('Creating API fingerprint section with ID: ' + this.sectionId, 'info');
            
            // First, make sure tab content exists
            const tabContent = document.getElementById('tab-api-fingerprint');
            if (!tabContent) {
                window.utils.log('Could not find tab-api-fingerprint element', 'error');
                return null;
            }
            
            // Check if section already exists
            let section = document.getElementById(this.sectionId);
            if (section) {
                window.utils.log('API fingerprint section already exists', 'info');
                return section;
            }
            
            // Create section directly
            section = document.createElement('div');
            section.className = 'info-section';
            section.id = this.sectionId;
            
            const heading = document.createElement('h2');
            heading.textContent = this.sectionTitle;
            section.appendChild(heading);
            
            const container = document.createElement('ul');
            container.className = 'property-list';
            section.appendChild(container);
            
            // Add immediately to tab content
            tabContent.appendChild(section);
            
            // Add initial placeholder content
            const introItem = document.createElement('li');
            const introName = document.createElement('span');
            introName.className = 'property-name';
            introName.textContent = 'API Fingerprinting';
            
            const introValue = document.createElement('span');
            introValue.className = 'property-value';
            introValue.textContent = 'Analyzing browser APIs for fingerprinting...';
            
            introItem.appendChild(introName);
            introItem.appendChild(introValue);
            container.appendChild(introItem);
            
            window.utils.log('API fingerprint section created successfully', 'info');
            return section;
        } catch (e) {
            window.utils.log('Error creating API fingerprint section: ' + e.message, 'error');
            return null;
        }
    }

    /**
     * Analyze Performance API for hardware fingerprinting
     * Measures timing characteristics that can identify hardware
     */
    _detectPerformanceAPI() {
        try {
            const performanceResults = {};
            const performanceFingerprints = [];
            window.utils.addInfo(this.sectionId, 'Performance API', 'Measuring timing characteristics...');
            
            // Check if Performance API is available
            if (window.performance) {
                performanceResults.available = true;
                
                // Get navigation timing metrics
                if (performance.timing) {
                    const timing = performance.timing;
                    performanceResults.loadTime = timing.loadEventEnd - timing.navigationStart;
                    performanceResults.domContentLoaded = timing.domContentLoadedEventEnd - timing.navigationStart;
                    performanceResults.networkLatency = timing.responseEnd - timing.requestStart;
                    
                    window.utils.addInfo(this.sectionId, 'Page Load Time', `${performanceResults.loadTime} ms`);
                    window.utils.addInfo(this.sectionId, 'DOM Content Loaded', `${performanceResults.domContentLoaded} ms`);
                    window.utils.addInfo(this.sectionId, 'Network Latency', `${performanceResults.networkLatency} ms`);
                    
                    // Add these as fingerprinting data
                    performanceFingerprints.push(
                        `load:${performanceResults.loadTime}`,
                        `dcl:${performanceResults.domContentLoaded}`,
                        `net:${performanceResults.networkLatency}`
                    );
                }
                
                // Run computational benchmark for CPU fingerprinting
                const startTime = performance.now();
                
                // Perform a computation-heavy task
                const iterations = 10000;
                let result = 0;
                for (let i = 0; i < iterations; i++) {
                    result += Math.sin(i) * Math.cos(i);
                }
                
                const endTime = performance.now();
                const computationTime = endTime - startTime;
                
                performanceResults.computationBenchmark = computationTime.toFixed(2);
                window.utils.addInfo(this.sectionId, 'Computation Benchmark', `${performanceResults.computationBenchmark} ms`);
                performanceFingerprints.push(`comp:${performanceResults.computationBenchmark}`);
                
                // Measure memory operations (array creation and manipulation)
                const memStart = performance.now();
                const largeArray = new Array(100000).fill(0).map((_, i) => i);
                const sorted = largeArray.sort(() => Math.random() - 0.5);
                const memEnd = performance.now();
                
                performanceResults.memoryOperationTime = (memEnd - memStart).toFixed(2);
                window.utils.addInfo(this.sectionId, 'Memory Operation Time', `${performanceResults.memoryOperationTime} ms`);
                performanceFingerprints.push(`mem:${performanceResults.memoryOperationTime}`);
                
                // Calculate performance fingerprint hash
                if (performanceFingerprints.length > 0) {
                    performanceResults.fingerprint = this._simpleHash(performanceFingerprints.join('|'));
                    window.utils.addInfo(this.sectionId, 'Performance Fingerprint', performanceResults.fingerprint);
                }
                
                // Detect performance anomalies that might indicate a VM or emulation
                if (computationTime < 1) {
                    window.utils.addInfo(this.sectionId, 'Suspicious Pattern', 'Unusually fast computation (possible time manipulation)');
                    this.results.suspicious.push('Unusually fast computation time');
                }
            } else {
                performanceResults.available = false;
                window.utils.addInfo(this.sectionId, 'Performance API', 'Not available');
            }
            
            this.results.performance = performanceResults;
            this.apiData.performance = performanceResults;
            
        } catch (e) {
            window.utils.log('Error in Performance API detection: ' + e.message, 'error');
            window.utils.addInfo(this.sectionId, 'Performance API Error', e.message);
        }
    }

    /**
     * Analyze Device Memory API
     * Reports the approximate amount of device RAM memory
     */
    _detectDeviceMemoryAPI() {
        try {
            const memoryResults = {};
            window.utils.addInfo(this.sectionId, 'Memory Information', '', 'section-subheader');
            
            // Check if Device Memory API is available
            if (navigator.deviceMemory !== undefined) {
                memoryResults.available = true;
                memoryResults.deviceMemory = navigator.deviceMemory;
                window.utils.addInfo(this.sectionId, 'Device Memory', `${memoryResults.deviceMemory} GB`);
                
                // Check for suspicious values
                if (navigator.deviceMemory < 0.5) {
                    window.utils.addInfo(this.sectionId, 'Suspicious Pattern', 'Unusually low device memory (possible VM)');
                    this.results.suspicious.push('Unusually low device memory');
                }
            } else {
                memoryResults.available = false;
                window.utils.addInfo(this.sectionId, 'Device Memory API', 'Not available');
            }
            
            // Check for memory info from performance API if available
            if (performance.memory) {
                memoryResults.totalJSHeapSize = this._formatBytes(performance.memory.totalJSHeapSize);
                memoryResults.usedJSHeapSize = this._formatBytes(performance.memory.usedJSHeapSize);
                memoryResults.jsHeapSizeLimit = this._formatBytes(performance.memory.jsHeapSizeLimit);
                
                window.utils.addInfo(this.sectionId, 'JS Heap Size Used', memoryResults.usedJSHeapSize);
                window.utils.addInfo(this.sectionId, 'JS Heap Size Total', memoryResults.totalJSHeapSize);
                window.utils.addInfo(this.sectionId, 'JS Heap Size Limit', memoryResults.jsHeapSizeLimit);
                
                // Calculate memory usage percentage
                const usagePercent = (performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit * 100).toFixed(2);
                window.utils.addInfo(this.sectionId, 'Memory Usage', `${usagePercent}%`);
                
                memoryResults.fingerprint = this._simpleHash(`${usagePercent}|${memoryResults.jsHeapSizeLimit}`);
                window.utils.addInfo(this.sectionId, 'Memory Fingerprint', memoryResults.fingerprint);
            }
            
            this.results.memory = memoryResults;
            this.apiData.memory = memoryResults;
            
        } catch (e) {
            window.utils.log('Error in Device Memory API detection: ' + e.message, 'error');
            window.utils.addInfo(this.sectionId, 'Memory API Error', e.message);
        }
    }

    /**
     * Generate an audio fingerprint using the Web Audio API
     */
    _detectAudioAPI() {
        try {
            const audioResults = {};
            window.utils.addInfo(this.sectionId, 'Audio Information', '', 'section-subheader');
            
            // Check if AudioContext is available
            if (window.AudioContext || window.webkitAudioContext) {
                audioResults.available = true;
                const AudioContext = window.AudioContext || window.webkitAudioContext;
                
                // Create audio context
                const audioContext = new AudioContext();
                audioResults.sampleRate = audioContext.sampleRate;
                audioResults.audioState = audioContext.state;
                
                window.utils.addInfo(this.sectionId, 'Audio Context State', audioResults.audioState);
                window.utils.addInfo(this.sectionId, 'Audio Sample Rate', `${audioResults.sampleRate} Hz`);
                
                // Get destination channel count
                const destinationChannelCount = audioContext.destination.channelCount;
                audioResults.channelCount = destinationChannelCount;
                window.utils.addInfo(this.sectionId, 'Audio Channel Count', audioResults.channelCount);
                
                // Generate audio fingerprint by processing a simple oscillator
                const oscillator = audioContext.createOscillator();
                const analyser = audioContext.createAnalyser();
                
                oscillator.connect(analyser);
                analyser.fftSize = 2048;
                
                const bufferLength = analyser.frequencyBinCount;
                const dataArray = new Uint8Array(bufferLength);
                
                oscillator.type = 'triangle';
                oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
                oscillator.start();
                
                // Wait briefly for audio to process
                setTimeout(() => {
                    analyser.getByteFrequencyData(dataArray);
                    oscillator.stop();
                    audioContext.close();
                    
                    // Create a simplified fingerprint from the frequency data
                    let fingerprintData = '';
                    
                    // Sample 10 points from the frequency data for a fingerprint
                    for (let i = 0; i < 10; i++) {
                        const index = Math.floor(i * (bufferLength / 10));
                        fingerprintData += dataArray[index].toString(16);
                    }
                    
                    audioResults.fingerprint = this._simpleHash(fingerprintData);
                    window.utils.addInfo(this.sectionId, 'Audio Fingerprint', audioResults.fingerprint);
                    
                    this.results.audio = audioResults;
                    this.apiData.audio = audioResults;
                }, 500);
                
                // Check for anomalies - unusual sample rates can indicate virtualization
                const commonSampleRates = [44100, 48000, 96000, 192000];
                if (!commonSampleRates.includes(audioResults.sampleRate)) {
                    window.utils.addInfo(this.sectionId, 'Suspicious Pattern', `Unusual audio sample rate: ${audioResults.sampleRate}`);
                    this.results.suspicious.push('Unusual audio sample rate');
                }
                
            } else {
                audioResults.available = false;
                window.utils.addInfo(this.sectionId, 'Web Audio API', 'Not available');
                this.results.audio = audioResults;
                this.apiData.audio = audioResults;
            }
            
        } catch (e) {
            window.utils.log('Error in Audio API detection: ' + e.message, 'error');
            window.utils.addInfo(this.sectionId, 'Audio API Error', e.message);
        }
    }

    /**
     * Check Battery Status API for fingerprinting and tracking potential
     */
    _detectBatteryAPI() {
        try {
            const batteryResults = {};
            window.utils.addInfo(this.sectionId, 'Battery Information', '', 'section-subheader');
            
            // Check if Battery API is available
            if (navigator.getBattery) {
                batteryResults.available = true;
                
                navigator.getBattery().then(battery => {
                    // Get initial battery status
                    batteryResults.charging = battery.charging;
                    batteryResults.level = (battery.level * 100).toFixed(2);
                    batteryResults.chargingTime = battery.chargingTime === Infinity ? 'Infinity' : battery.chargingTime;
                    batteryResults.dischargingTime = battery.dischargingTime === Infinity ? 'Infinity' : battery.dischargingTime;
                    
                    window.utils.addInfo(this.sectionId, 'Battery Charging', batteryResults.charging ? 'Yes' : 'No');
                    window.utils.addInfo(this.sectionId, 'Battery Level', `${batteryResults.level}%`);
                    
                    if (battery.chargingTime !== Infinity) {
                        window.utils.addInfo(this.sectionId, 'Charging Time', `${Math.floor(battery.chargingTime / 60)} minutes`);
                    }
                    
                    if (battery.dischargingTime !== Infinity) {
                        window.utils.addInfo(this.sectionId, 'Discharging Time', `${Math.floor(battery.dischargingTime / 60)} minutes`);
                    }
                    
                    // Generate battery fingerprint
                    const batteryFingerprint = `${batteryResults.charging}|${batteryResults.level}`;
                    batteryResults.fingerprint = this._simpleHash(batteryFingerprint);
                    window.utils.addInfo(this.sectionId, 'Battery Fingerprint', batteryResults.fingerprint);
                    
                    // Check for suspicious patterns
                    if (batteryResults.level === '100.00' && !batteryResults.charging) {
                        window.utils.addInfo(this.sectionId, 'Suspicious Pattern', 'Battery always at 100% but not charging (possible emulation)');
                        this.results.suspicious.push('Battery emulation detected');
                    }
                    
                    if (battery.dischargingTime === 0 && battery.level < 1) {
                        window.utils.addInfo(this.sectionId, 'Suspicious Pattern', 'Battery reporting impossible values');
                        this.results.suspicious.push('Impossible battery values');
                    }
                    
                    this.results.battery = batteryResults;
                    this.apiData.battery = batteryResults;
                });
            } else {
                batteryResults.available = false;
                window.utils.addInfo(this.sectionId, 'Battery Status API', 'Not available');
                this.results.battery = batteryResults;
                this.apiData.battery = batteryResults;
            }
            
        } catch (e) {
            window.utils.log('Error in Battery API detection: ' + e.message, 'error');
            window.utils.addInfo(this.sectionId, 'Battery API Error', e.message);
        }
    }

    /**
     * Detect additional suspicious API behaviors
     */
    _detectSuspiciousAPIs() {
        try {
            window.utils.addInfo(this.sectionId, 'Suspicious API Behavior', '', 'section-subheader');
            
            // 1. Check for Navigator API tampering
            const navigatorProps = [
                'userAgent', 'appVersion', 'platform', 'product', 
                'productSub', 'vendor', 'language', 'languages'
            ];
            
            let tamperedProps = [];
            
            for (const prop of navigatorProps) {
                const descriptor = Object.getOwnPropertyDescriptor(Navigator.prototype, prop) || 
                                  Object.getOwnPropertyDescriptor(Object.getPrototypeOf(navigator), prop);
                
                if (descriptor && (descriptor.get && descriptor.get.toString().indexOf('native code') === -1)) {
                    tamperedProps.push(prop);
                }
            }
            
            if (tamperedProps.length > 0) {
                window.utils.addInfo(this.sectionId, 'Navigator API Tampering', 
                    `Modified properties: ${tamperedProps.join(', ')}`);
                this.results.suspicious.push('Navigator API tampering detected');
            } else {
                window.utils.addInfo(this.sectionId, 'Navigator API Tampering', 'Not detected');
            }
            
            // 2. Check for inconsistent permissions behavior
            if (navigator.permissions) {
                navigator.permissions.query({name: 'notifications'})
                    .then(permission => {
                        if (permission.state === 'denied' && Notification.permission === 'default') {
                            window.utils.addInfo(this.sectionId, 'Permissions API Inconsistency', 'Detected');
                            this.results.suspicious.push('Inconsistent permissions behavior');
                        } else {
                            window.utils.addInfo(this.sectionId, 'Permissions API Inconsistency', 'Not detected');
                        }
                    })
                    .catch(e => {
                        window.utils.addInfo(this.sectionId, 'Permissions API Error', e.message);
                    });
            }
            
            // 3. Check for Sensor API availability and behavior
            if (window.DeviceMotionEvent || window.DeviceOrientationEvent) {
                let sensorAvailabilityStatus = [];
                
                if (window.DeviceMotionEvent) sensorAvailabilityStatus.push('Motion');
                if (window.DeviceOrientationEvent) sensorAvailabilityStatus.push('Orientation');
                
                window.utils.addInfo(this.sectionId, 'Device Sensors Available', sensorAvailabilityStatus.join(', '));
                
                // Check for permission mismatches or unusual behavior
                if (window.DeviceMotionEvent && typeof DeviceMotionEvent.requestPermission === 'function') {
                    window.utils.addInfo(this.sectionId, 'Motion Sensors', 'Requires permission (iOS)');
                }
            } else {
                window.utils.addInfo(this.sectionId, 'Device Sensors', 'Not available');
                
                // Check if this is suspicious based on user agent
                if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
                    window.utils.addInfo(this.sectionId, 'Suspicious Pattern', 'Mobile device without sensor APIs');
                    this.results.suspicious.push('Missing sensor APIs on mobile device');
                }
            }
            
            // 4. Check for Speech API availability and constraints
            if (window.SpeechSynthesis || window.SpeechRecognition || window.webkitSpeechRecognition) {
                let speechAPIs = [];
                
                if (window.SpeechSynthesis) speechAPIs.push('Speech Synthesis');
                if (window.SpeechRecognition || window.webkitSpeechRecognition) speechAPIs.push('Speech Recognition');
                
                window.utils.addInfo(this.sectionId, 'Speech APIs Available', speechAPIs.join(', '));
                
                // Check for speech synthesis voices
                if (window.speechSynthesis) {
                    const voices = window.speechSynthesis.getVoices();
                    window.utils.addInfo(this.sectionId, 'Speech Synthesis Voices', voices.length);
                    
                    if (voices.length === 0) {
                        window.utils.addInfo(this.sectionId, 'Suspicious Pattern', 'Speech synthesis with no voices');
                        this.results.suspicious.push('Speech synthesis API without voices');
                    }
                }
            }
            
        } catch (e) {
            window.utils.log('Error in suspicious API detection: ' + e.message, 'error');
            window.utils.addInfo(this.sectionId, 'API Analysis Error', e.message);
        }
    }

    /**
     * Add a summary of all API fingerprinting results
     */
    _addFingerprintSummary() {
        try {
            window.utils.addInfo(this.sectionId, 'API Fingerprinting Summary', '', 'section-subheader');
            
            // Count of available APIs
            let availableAPIs = 0;
            const totalAPIs = 4; // Performance, Memory, Audio, Battery
            
            if (this.results.performance.available) availableAPIs++;
            if (this.results.memory.available) availableAPIs++;
            if (this.results.audio && this.results.audio.available) availableAPIs++;
            if (this.results.battery && this.results.battery.available) availableAPIs++;
            
            window.utils.addInfo(this.sectionId, 'Available APIs', `${availableAPIs}/${totalAPIs}`);
            
            // Combined fingerprint from all available sources
            const fingerprintSources = [];
            
            if (this.results.performance.fingerprint) {
                fingerprintSources.push(this.results.performance.fingerprint);
            }
            
            if (this.results.memory.fingerprint) {
                fingerprintSources.push(this.results.memory.fingerprint);
            }
            
            if (this.results.audio && this.results.audio.fingerprint) {
                fingerprintSources.push(this.results.audio.fingerprint);
            }
            
            if (this.results.battery && this.results.battery.fingerprint) {
                fingerprintSources.push(this.results.battery.fingerprint);
            }
            
            if (fingerprintSources.length > 0) {
                const combinedFingerprint = this._simpleHash(fingerprintSources.join('|'));
                this.apiData.fingerprint = combinedFingerprint;
                window.utils.addInfo(this.sectionId, 'Combined API Fingerprint', combinedFingerprint);
            }
            
            // Report suspicious patterns
            if (this.results.suspicious.length > 0) {
                window.utils.addInfo(this.sectionId, 'Suspicious Patterns Detected', this.results.suspicious.length);
                this.apiData.suspiciousCount = this.results.suspicious.length;
            } else {
                window.utils.addInfo(this.sectionId, 'Suspicious Patterns Detected', 'None');
                this.apiData.suspiciousCount = 0;
            }
            
        } catch (e) {
            window.utils.log('Error in API fingerprint summary: ' + e.message, 'error');
        }
    }

    /**
     * Simple hash function for fingerprinting
     */
    _simpleHash(str) {
        let hash = 0;
        if (str.length === 0) return hash.toString(16);
        
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        
        return hash.toString(16); // Return as hex string
    }
    
    /**
     * Format bytes into human-readable format
     */
    _formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    /**
     * Detect and analyze PerformanceEventTiming API
     */
    _detectPerformanceEventTiming() {
        window.utils.log('Detecting Performance Event Timing API...');
        
        if (!window.PerformanceObserver || !window.PerformanceObserver.supportedEntryTypes ||
            !window.PerformanceObserver.supportedEntryTypes.includes('event')) {
            window.utils.log('PerformanceEventTiming API not supported', 'warning');
            this.results.eventTiming = {
                supported: false,
                events: {},
                patterns: []
            };
            return;
        }
        
        this.results.eventTiming = {
            supported: true,
            events: {},
            patterns: [],
            categorizedEvents: {}
        };
        
        this.apiData.eventTiming = this.results.eventTiming;
        
        // Create info section for user feedback
        if (!document.getElementById(this.sectionId)) {
            this._createSection();
        }
        
        // Set monitoring duration (in ms)
        const monitorDuration = this.monitorDuration || 5000;
        let monitoringStatus = "Starting...";
        window.utils.addInfo(this.sectionId, 'Monitoring Duration', `${monitorDuration/1000} seconds`);
        
        try {
            // Status indicator to show user that monitoring is active
            window.utils.addInfo(this.sectionId, 'Monitoring Status', monitoringStatus);
            
            // Instructions for user
            window.utils.addInfo(this.sectionId, 'Instructions', 
                'Please interact with the page naturally (click, type, move mouse) for a few seconds while we analyze event patterns.');
            
            // Tracking variables
            const observedEvents = [];
            let isMonitoring = true;
            
            // Set timeout to stop monitoring after duration
            setTimeout(() => {
                isMonitoring = false;
                observer.disconnect();
                monitoringStatus = "Complete - Analyzing results...";
                window.utils.addInfo(this.sectionId, 'Monitoring Status', monitoringStatus);
                
                // Analyze collected events
                this._analyzeCollectedEvents(observedEvents);
            }, monitorDuration);
            
            // Create and start the observer
            const observer = new PerformanceObserver((list) => {
                if (!isMonitoring) return;
                
                // Update status on first event
                if (observedEvents.length === 0) {
                    monitoringStatus = "Active - capturing events...";
                    window.utils.addInfo(this.sectionId, 'Monitoring Status', monitoringStatus);
                }
                
                // Process entries
                const entries = list.getEntries();
                entries.forEach(entry => {
                    // Only process while monitoring is active
                    if (isMonitoring) {
                        observedEvents.push(entry);
                        window.utils.log(`Event captured: ${entry.name} (duration: ${entry.duration}ms)`);
                    }
                });
            });
            
            // Start observing
            observer.observe({ type: 'event', buffered: true, durationThreshold: 0 });
            window.utils.log('Event timing observer started');
            
        } catch (e) {
            window.utils.log('Error setting up event timing observer: ' + e.message, 'error');
            this.results.eventTiming.error = e.message;
        }
    }
    
    /**
     * Analyze the collected events from Performance Event Timing API
     */
    _analyzeCollectedEvents(events) {
        try {
            if (!events || events.length === 0) {
                window.utils.addInfo(this.sectionId, 'Results', 'No events captured during monitoring period');
                return;
            }
            
            window.utils.log(`Analyzing ${events.length} captured events`);
            
            // Group events by category
            const categorizedEvents = {};
            events.forEach(event => {
                const category = this._categorizeEvent(event);
                if (!categorizedEvents[category]) {
                    categorizedEvents[category] = [];
                }
                categorizedEvents[category].push(event);
            });
            
            // Store categorized events
            this.results.eventTiming.categorizedEvents = categorizedEvents;
            
            // Analyze each category separately
            const suspiciousPatterns = [];
            Object.keys(categorizedEvents).forEach(category => {
                const categoryEvents = categorizedEvents[category];
                const pattern = this._analyzeEventTimingPatterns(category, categoryEvents);
                if (pattern) {
                    suspiciousPatterns.push(pattern);
                }
                
                // Update results data
                if (!this.results.eventTiming.events[category]) {
                    this.results.eventTiming.events[category] = {
                        count: 0,
                        totalDelay: 0
                    };
                }
                
                this.results.eventTiming.events[category].count = categoryEvents.length;
                this.results.eventTiming.events[category].totalDelay = categoryEvents.reduce(
                    (sum, event) => sum + (event.processingStart ? (event.processingStart - event.startTime) : 0), 
                    0
                );
            });
            
            // Store suspicious patterns
            this.results.eventTiming.patterns = suspiciousPatterns;
            
            // Add summary information
            this._summarizeEventTiming(this.results.eventTiming);
            
            // Generate a simple fingerprint from the data if enough events
            if (events.length > 5) {
                // Simple fingerprint based on event timings
                const fingerprint = this._generateEventTimingFingerprint(events);
                this.results.eventTiming.fingerprint = fingerprint;
            }
            
        } catch (e) {
            window.utils.log('Error analyzing event timing data: ' + e.message, 'error');
        }
    }
    
    /**
     * Categorize an event by type
     */
    _categorizeEvent(event) {
        const name = event.name.toLowerCase();
        
        if (name.includes('mouse') || name.includes('pointer')) {
            return 'mouse';
        } else if (name.includes('key')) {
            return 'keyboard';
        } else if (name.includes('click')) {
            return 'click';
        } else if (name.includes('focus') || name.includes('blur')) {
            return 'focus';
        } else if (name.includes('touch')) {
            return 'touch';
        } else {
            return 'other';
        }
    }
    
    /**
     * Generate a fingerprint from event timing data
     */
    _generateEventTimingFingerprint(events) {
        try {
            // Simple fingerprinting based on event timing patterns
            if (events.length < 5) return null;
            
            // Calculate metrics
            const durations = events.map(e => e.duration || 0);
            const avgDuration = durations.reduce((sum, val) => sum + val, 0) / durations.length;
            
            const delays = events.map(e => e.processingStart ? (e.processingStart - e.startTime) : 0);
            const avgDelay = delays.reduce((sum, val) => sum + val, 0) / delays.length;
            
            // Create hash from these values
            const hash = (avgDuration * 1000).toFixed(0) + '-' + (avgDelay * 1000).toFixed(0) + '-' + events.length;
            
            return hash;
        } catch (e) {
            window.utils.log('Error generating event timing fingerprint: ' + e.message, 'error');
            return null;
        }
    }

    /**
     * Summarize event timing data after collection period ends
     */
    _summarizeEventTiming(results) {
        try {
            // Create summary section
            window.utils.addInfo(this.sectionId, 'Event Timing Summary', '', 'section-subheader');
            
            // Total events by category
            const categories = Object.keys(results.events);
            if (categories.length > 0) {
                const totalEvents = categories.reduce((sum, cat) => sum + results.events[cat].count, 0);
                window.utils.addInfo(this.sectionId, 'Total Events', totalEvents);
                
                // Breakdown by category
                categories.forEach(category => {
                    const data = results.events[category];
                    const avgDelay = data.count > 0 ? (data.totalDelay / data.count).toFixed(2) : 0;
                    window.utils.addInfo(this.sectionId, `${category} Events`, 
                        `${data.count} events (avg delay: ${avgDelay}ms)`);
                });
            } else {
                window.utils.addInfo(this.sectionId, 'Event Categories', 'No events recorded');
            }
            
            // Suspicious patterns detected - with appropriate context
            if (results.patterns && results.patterns.length > 0) {
                window.utils.addInfo(this.sectionId, 'Potential Anomalies', results.patterns.length, 
                                    results.patterns.length > 1 ? 'warning-indicator' : '');
                
                // Add a note about statistical nature
                window.utils.addInfo(this.sectionId, 'Note', 
                    'These are statistical anomalies that may indicate automation, but should be validated with additional signals before drawing conclusions.');
                
                // Show each pattern with more context
                results.patterns.forEach((pattern, index) => {
                    window.utils.addInfo(this.sectionId, `Anomaly ${index+1}`, pattern);
                });
            } else {
                window.utils.addInfo(this.sectionId, 'Timing Anomalies', 'None detected - input patterns appear human-like');
            }
            
            // Human baseline information - educate the user about normal ranges
            window.utils.addInfo(this.sectionId, 'Human Baselines', '', 'section-subheader');
            window.utils.addInfo(this.sectionId, 'Average Human Reaction Time', '200-300ms');
            window.utils.addInfo(this.sectionId, 'Typical Input Timing Variation', '15-80%');
            window.utils.addInfo(this.sectionId, 'Typical Mouse Movement Pattern', 'Non-linear with acceleration/deceleration');
            
            // Final fingerprint if available
            if (results.fingerprint) {
                window.utils.addInfo(this.sectionId, 'Event Timing Fingerprint', results.fingerprint);
            }
        } catch (e) {
            window.utils.log('Error in event timing summary: ' + e.message, 'error');
        }
    }

    /**
     * Analyze event timing patterns for a specific category
     */
    _analyzeEventTimingPatterns(category, events) {
        try {
            if (!events || events.length < 5) {
                return null; // Need at least 5 events to analyze patterns
            }
            
            // Extract event durations and calculate statistics
            const durations = events.map(e => e.duration || 0);
            const delays = events.map(e => e.processingStart ? (e.processingStart - e.startTime) : 0);
            
            // Calculate mean and standard deviation for timing consistency
            const mean = durations.reduce((sum, val) => sum + val, 0) / durations.length;
            const stdDev = Math.sqrt(durations.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / durations.length);
            
            // Coefficient of variation (lower values indicate more consistent timing)
            const timeCoeffVariation = mean === 0 ? 0 : (stdDev / mean) * 100;
            
            // Calculate input processing delay (time between event firing and processing)
            const totalDelay = delays.reduce((sum, val) => sum + val, 0);
            const avgInputDelay = delays.length > 0 ? totalDelay / delays.length : 0;
            
            // Check for consecutive identical intervals - a strong bot indicator
            const intervals = [];
            for (let i = 1; i < events.length; i++) {
                intervals.push(events[i].startTime - events[i-1].startTime);
            }
            
            // Count repeated intervals (rounded to nearest ms)
            const roundedIntervals = intervals.map(i => Math.round(i));
            const intervalCounts = {};
            roundedIntervals.forEach(interval => {
                intervalCounts[interval] = (intervalCounts[interval] || 0) + 1;
            });
            
            // Find the maximum repeat count for any interval
            const maxRepeatCount = Math.max(0, ...Object.values(intervalCounts));
            const repeatedIntervalRatio = maxRepeatCount / intervals.length;
            
            // Detection conditions - more conservative thresholds
            let suspiciousPattern = null;
            
            // Adjust thresholds based on event category
            if (category === 'mouse' || category === 'pointer') {
                // Mouse events should have natural variation
                if (timeCoeffVariation < 3 && events.length > 20) {
                    suspiciousPattern = `Unusually consistent mouse timing (${timeCoeffVariation.toFixed(2)}% variation across ${events.length} events)`;
                }
                else if (repeatedIntervalRatio > 0.8 && events.length > 15) {
                    const repeatedInterval = Object.keys(intervalCounts).find(
                        interval => intervalCounts[interval] === maxRepeatCount
                    );
                    suspiciousPattern = `Repeating mouse movement pattern (${maxRepeatCount} occurrences of ${repeatedInterval}ms interval)`;
                }
            } 
            else if (category === 'key' || category === 'keyboard') {
                // Keyboard events - human typing has natural pauses and variations
                if (timeCoeffVariation < 10 && events.length > 15) {
                    suspiciousPattern = `Unusually consistent keyboard timing (${timeCoeffVariation.toFixed(2)}% variation)`;
                }
                else if (avgInputDelay < 1 && events.length > 12) {
                    suspiciousPattern = `Unusually fast keyboard processing (${avgInputDelay.toFixed(2)}ms)`;
                }
            }
            else if (category === 'click') {
                // Click events - perfect regularity is suspicious
                if (timeCoeffVariation < 5 && events.length > 6) {
                    suspiciousPattern = `Unusually consistent click timing (${timeCoeffVariation.toFixed(2)}% variation)`;
                }
                else if (repeatedIntervalRatio > 0.9 && events.length > 5) {
                    const repeatedInterval = Object.keys(intervalCounts).find(
                        interval => intervalCounts[interval] === maxRepeatCount
                    );
                    suspiciousPattern = `Repeating click pattern (${maxRepeatCount} occurrences of ${repeatedInterval}ms interval)`;
                }
            }
            // Default case for other event types
            else if (timeCoeffVariation === 0 && events.length > 8) {
                suspiciousPattern = `Perfect timing consistency for ${category} events (exactly ${mean.toFixed(2)}ms across ${events.length} events)`;
            }
            
            if (suspiciousPattern) {
                window.utils.log(`[EventTimingAPI] ${suspiciousPattern}`, 'warning');
            }
            
            return suspiciousPattern;
        } catch (e) {
            window.utils.log('Error analyzing event timing patterns: ' + e.message, 'error');
            return null;
        }
    }
}

// Export the detector
window.APIFingerprintDetector = APIFingerprintDetector; 