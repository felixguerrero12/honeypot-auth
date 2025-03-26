/**
 * Graphics Information Detector
 * Collects and analyzes graphics hardware, WebGL, and rendering capabilities
 */

class GraphicsDetector {
    constructor() {
        this.sectionId = 'graphics-info';
        this.sectionTitle = 'Graphics Information';
        this.graphicsData = {};
    }

    /**
     * Run all graphics detection tests
     */
    detect() {
        this._createSection();
        this._detectWebGL();
        this._detectCanvas();
        this._detectHardwareAccel();
        this._detectColorDepth();
        
        return this.graphicsData;
    }

    /**
     * Create the graphics info section in the DOM
     */
    _createSection() {
        return window.utils.createInfoSection(this.sectionId, this.sectionTitle);
    }

    /**
     * Detect WebGL information
     */
    _detectWebGL() {
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            
            if (!gl) {
                window.utils.addInfo(this.sectionId, 'WebGL', 'Not supported');
                this.graphicsData.webglSupported = false;
                return;
            }
            
            this.graphicsData.webglSupported = true;
            window.utils.addInfo(this.sectionId, 'WebGL', 'Supported');
            
            // Get renderer information
            const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
            if (debugInfo) {
                const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
                const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
                
                this.graphicsData.glVendor = vendor;
                this.graphicsData.glRenderer = renderer;
                
                window.utils.addInfo(this.sectionId, 'Graphics Vendor', vendor);
                window.utils.addInfo(this.sectionId, 'Graphics Renderer', renderer);
            }
            
            // Get WebGL version and supported extensions
            const version = gl.getParameter(gl.VERSION);
            const shadingLanguage = gl.getParameter(gl.SHADING_LANGUAGE_VERSION);
            const extensions = gl.getSupportedExtensions();
            
            this.graphicsData.glVersion = version;
            this.graphicsData.shadingLanguage = shadingLanguage;
            
            window.utils.addInfo(this.sectionId, 'WebGL Version', version);
            window.utils.addInfo(this.sectionId, 'Shading Language', shadingLanguage);
            
            // Get max parameters
            const maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
            const maxViewportDims = gl.getParameter(gl.MAX_VIEWPORT_DIMS);
            
            this.graphicsData.maxTextureSize = maxTextureSize;
            
            window.utils.addInfo(this.sectionId, 'Max Texture Size', maxTextureSize + 'px');
            if (maxViewportDims) {
                window.utils.addInfo(this.sectionId, 'Max Viewport Dimensions', maxViewportDims[0] + 'x' + maxViewportDims[1]);
            }
        } catch (e) {
            window.utils.log('Error detecting WebGL: ' + e.message, 'error');
            window.utils.addInfo(this.sectionId, 'WebGL', 'Error detecting');
            this.graphicsData.webglSupported = false;
        }
    }

    /**
     * Detect canvas rendering capabilities
     */
    _detectCanvas() {
        try {
            const canvas = document.createElement('canvas');
            const canvasSupported = !!(canvas.getContext && canvas.getContext('2d'));
            
            this.graphicsData.canvasSupported = canvasSupported;
            window.utils.addInfo(this.sectionId, 'Canvas', canvasSupported ? 'Supported' : 'Not supported');
            
            if (canvasSupported) {
                // Generate canvas fingerprint
                canvas.width = 200;
                canvas.height = 50;
                const ctx = canvas.getContext('2d');
                
                // Draw background
                ctx.fillStyle = 'rgb(255, 255, 255)';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                // Draw text
                ctx.fillStyle = 'rgb(0, 0, 255)';
                ctx.font = '16px Arial';
                ctx.fillText('Canvas Fingerprint', 10, 30);
                
                // Draw shapes
                ctx.strokeStyle = 'rgb(255, 0, 0)';
                ctx.beginPath();
                ctx.arc(150, 25, 20, 0, Math.PI * 2, true);
                ctx.stroke();
                
                // Get data URL
                const dataURL = canvas.toDataURL();
                
                // Generate hash from dataURL
                let hash = 0;
                for (let i = 0; i < dataURL.length; i++) {
                    hash = ((hash << 5) - hash) + dataURL.charCodeAt(i);
                    hash = hash & hash; // Convert to 32bit integer
                }
                
                this.graphicsData.canvasFingerprint = Math.abs(hash).toString(16);
                window.utils.addInfo(this.sectionId, 'Canvas Fingerprint', this.graphicsData.canvasFingerprint);
            }
        } catch (e) {
            window.utils.log('Error detecting Canvas: ' + e.message, 'error');
            window.utils.addInfo(this.sectionId, 'Canvas', 'Error detecting');
            this.graphicsData.canvasSupported = false;
        }
    }

    /**
     * Detect hardware acceleration
     */
    _detectHardwareAccel() {
        // Create a separate section for hardware acceleration
        const sectionId = 'hardware-accel';
        window.utils.createInfoSection(sectionId, 'Hardware Acceleration');
        
        try {
            let hardwareAccel = false;
            const canvas = document.createElement('canvas');
            document.body.appendChild(canvas);
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            
            if (gl) {
                const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
                if (debugInfo) {
                    const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
                    hardwareAccel = !(/(SwiftShader|Software|Microsoft Basic)/i.test(renderer));
                    
                    this.graphicsData.hardwareAccelerated = hardwareAccel;
                    
                    window.utils.addInfo(sectionId, 'Hardware Acceleration', hardwareAccel ? 'Enabled' : 'Disabled');
                    window.utils.addInfo(sectionId, 'Renderer Type', hardwareAccel ? 'Hardware Accelerated' : 'Software Rendered');
                    window.utils.addInfo(sectionId, 'Renderer', renderer);
                } else {
                    window.utils.addInfo(sectionId, 'Hardware Acceleration', 'Unknown - debug info not available');
                }
            } else {
                window.utils.addInfo(sectionId, 'Hardware Acceleration', 'Unknown - WebGL not supported');
            }
            
            document.body.removeChild(canvas);
        } catch (e) {
            window.utils.log('Error detecting hardware acceleration: ' + e.message, 'error');
            window.utils.addInfo(sectionId, 'Hardware Acceleration', 'Error detecting');
        }
    }

    /**
     * Detect color depth
     */
    _detectColorDepth() {
        const jsColorDepth = window.screen.colorDepth || window.screen.pixelDepth || 'Not available';
        this.graphicsData.colorDepth = jsColorDepth;
        window.utils.addInfo(this.sectionId, 'JS-Detected Color Depth', jsColorDepth + ' bits');
        
        // Create a separate section for color depth detection
        const sectionId = 'color-depth-info';
        window.utils.createInfoSection(sectionId, 'Color Depth Detection');
        
        // Add JS-detected color depth
        window.utils.addInfo(sectionId, 'JS-Detected Color Depth', jsColorDepth + ' bits');
        
        // CSS Media Query detection for color depth
        let cssColorDepth = 'Unknown';
        let bitsPerColor = 0;
        
        // Test for various color depth levels using media queries
        const testColorDepth = (query, bits) => {
            const match = window.matchMedia(query).matches;
            window.utils.addInfo(sectionId, `Your display has at least ${bits} bits per color`, match);
            if (match && bits > bitsPerColor) {
                bitsPerColor = bits;
                cssColorDepth = bits + ' bits per color';
            }
        };
        
        // Test monochrome
        const isMonochrome = window.matchMedia('(monochrome)').matches;
        window.utils.addInfo(sectionId, 'Your display is monochrome!', isMonochrome);
        window.utils.addInfo(sectionId, 'Your display is not monochrome!', !isMonochrome);
        
        // Test various color depths
        testColorDepth('(min-color: 2)', 2);
        testColorDepth('(min-color: 3)', 3);
        testColorDepth('(min-color: 4)', 4);
        testColorDepth('(min-color: 5)', 5);
        testColorDepth('(min-color: 6)', 6);
        testColorDepth('(min-color: 7)', 7);
        testColorDepth('(min-color: 8)', 8);
        
        window.utils.addInfo(sectionId, 'CSS-Detected Color Depth', cssColorDepth);
        this.graphicsData.cssColorDepth = cssColorDepth;
        
        // RDP Detection (remote desktop detection)
        // Remote Desktop Protocol typically changes color depth
        // When using RDP, JS-reported depth often differs from CSS media query results
        let isRDP = false;
        let rdpConfidence = 'Low';
        
        if (jsColorDepth === 24 || jsColorDepth === 32) {  // Normal color depth for modern displays
            // If CSS reports significantly lower than JS, it may be RDP
            if (bitsPerColor <= 6 && bitsPerColor > 0) {  // RDP often uses 16-bit color (5-6 bits per channel)
                isRDP = true;
                rdpConfidence = 'High';
            }
        } else if (jsColorDepth === 16) {  // Already 16-bit
            if (bitsPerColor !== 5 && bitsPerColor !== 6) {  // Should be 5-6 bits per channel
                isRDP = true;
                rdpConfidence = 'Medium';
            }
        } else if (jsColorDepth === 8) {  // 8-bit color (rare on modern systems unless RDP)
            isRDP = true;
            rdpConfidence = 'Very High';
        }
        
        window.utils.addInfo(sectionId, 'RDP Connection Detected', isRDP ? 'Yes' : 'No');
        window.utils.addInfo(sectionId, 'RDP Detection Confidence', isRDP ? rdpConfidence : 'N/A');
        window.utils.addInfo(sectionId, 'RDP Status', isRDP ? 
            'You are likely using Remote Desktop Protocol.' : 
            'You are not using RDP.');
        
        this.graphicsData.rdpDetected = isRDP;
        this.graphicsData.rdpConfidence = isRDP ? rdpConfidence : 'N/A';
    }
}

// Export the detector
window.GraphicsDetector = GraphicsDetector; 