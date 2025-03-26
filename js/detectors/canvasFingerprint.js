/**
 * Canvas Fingerprinting Module
 * Generates unique fingerprints based on canvas rendering differences
 * between browsers and devices
 */

class CanvasFingerprintDetector {
    constructor() {
        this.sectionId = 'canvas-fingerprint-info';
        this.sectionTitle = 'Canvas Fingerprint';
        this.fingerprintData = {};
    }

    /**
     * Start fingerprint detection
     */
    detect() {
        this._createSection();
        this._generateCanvasFingerprint();
        this._generateWebGLFingerprint();
        return this.fingerprintData;
    }

    /**
     * Create the fingerprint section in the DOM
     */
    _createSection() {
        if (window.utils && window.utils.log) {
            window.utils.log('Creating canvas fingerprint section', 'info');
        } else {
            console.log('Creating canvas fingerprint section');
        }
        
        // Find the appropriate tab for canvas fingerprint content
        const tabContent = document.getElementById('tab-canvas');
        if (tabContent) {
            // Create section inside the tab
            const section = document.createElement('div');
            section.id = this.sectionId;
            section.className = 'info-section';
            
            // Create section header
            const header = document.createElement('h2');
            header.textContent = this.sectionTitle;
            section.appendChild(header);
            
            // Create property list container
            const propertyList = document.createElement('div');
            propertyList.className = 'property-list';
            section.appendChild(propertyList);
            
            // Add section to tab content
            tabContent.appendChild(section);
            
            return section;
        } else {
            // Fallback to the original createInfoSection if tab not found
            return window.utils.createInfoSection(this.sectionId, this.sectionTitle);
        }
    }
    
    /**
     * Generate a canvas fingerprint
     */
    _generateCanvasFingerprint() {
        try {
            // Create a canvas element
            const canvas = document.createElement('canvas');
            canvas.width = 300;
            canvas.height = 150;
            const ctx = canvas.getContext('2d');
            
            // Draw a variety of elements to create a unique fingerprint
            
            // 1. Draw text with different fonts
            const text = 'Canvas Fingerprint 👾 123!';
            const fonts = [
                '14px Arial', 
                'bold 18px Times New Roman', 
                'italic 12px Courier New',
                '16px Georgia',
                '20px Verdana'
            ];
            
            fonts.forEach((font, i) => {
                ctx.font = font;
                ctx.fillStyle = `rgb(${50 + i * 40}, ${i * 40}, ${150 - i * 20})`;
                ctx.textBaseline = 'top';
                ctx.fillText(text, 10, 20 + i * 25);
            });
            
            // 2. Draw some geometric shapes
            ctx.beginPath();
            ctx.arc(150, 75, 50, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(100, 100, 200, 0.8)';
            ctx.stroke();
            
            ctx.beginPath();
            ctx.rect(75, 40, 50, 50);
            ctx.fillStyle = 'rgba(200, 100, 100, 0.6)';
            ctx.fill();
            
            // 3. Draw shapes with different blend modes
            ctx.globalCompositeOperation = 'multiply';
            
            for (let i = 0; i < 5; i++) {
                const x = 220 - i * 15;
                const y = 40 + i * 15;
                const radius = 20;
                
                ctx.beginPath();
                ctx.arc(x, y, radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${255 - i * 40}, ${i * 50}, ${150}, 0.7)`;
                ctx.fill();
            }
            
            // 4. Add some gradients
            ctx.globalCompositeOperation = 'source-over';
            const gradient = ctx.createLinearGradient(0, 150, 300, 0);
            gradient.addColorStop(0, 'rgba(200, 200, 200, 0.2)');
            gradient.addColorStop(1, 'rgba(100, 100, 200, 0.2)');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, 300, 150);
            
            // 5. Draw a complex path
            ctx.beginPath();
            ctx.moveTo(10, 150);
            ctx.lineTo(50, 140);
            ctx.lineTo(90, 150);
            ctx.lineTo(130, 110);
            ctx.lineTo(170, 150);
            ctx.lineTo(210, 130);
            ctx.lineTo(250, 150);
            ctx.lineTo(290, 120);
            ctx.strokeStyle = 'rgba(100, 200, 100, 0.8)';
            ctx.lineWidth = 3;
            ctx.stroke();
            
            // Get data URL from canvas
            const dataURL = canvas.toDataURL();
            
            // Generate hash
            const hash = this._generateHash(dataURL);
            
            // Store result
            this.fingerprintData.canvasHash = hash;
            this.fingerprintData.canvasDataLength = dataURL.length;
            
            // Display in the UI
            window.utils.addInfo(this.sectionId, 'Canvas Fingerprint Hash', hash);
            window.utils.addInfo(this.sectionId, 'Canvas Data Size', dataURL.length + ' bytes');
            
            // Create a visual representation of the fingerprint
            this._createCanvasVisual(dataURL);
            
            return hash;
        } catch (e) {
            window.utils.log('Error generating canvas fingerprint: ' + e.message, 'error');
            window.utils.addInfo(this.sectionId, 'Canvas Fingerprint', 'Error: ' + e.message);
            return null;
        }
    }
    
    /**
     * Generate a WebGL fingerprint
     */
    _generateWebGLFingerprint() {
        try {
            const canvas = document.createElement('canvas');
            canvas.width = 200;
            canvas.height = 100;
            
            // Try to get WebGL context
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            
            if (!gl) {
                window.utils.addInfo(this.sectionId, 'WebGL Support', 'Not available');
                return null;
            }
            
            // Collect WebGL attributes
            const attributes = {
                vendor: gl.getParameter(gl.VENDOR),
                renderer: gl.getParameter(gl.RENDERER),
                version: gl.getParameter(gl.VERSION),
                shadingLanguageVersion: gl.getParameter(gl.SHADING_LANGUAGE_VERSION),
                antialiasing: gl.getContextAttributes().antialias ? 'Enabled' : 'Disabled',
                extensions: gl.getSupportedExtensions()
            };
            
            // Get extended information if available
            const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
            if (debugInfo) {
                attributes.unmaskedVendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
                attributes.unmaskedRenderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
            }
            
            // Generate a string from the attributes
            let attributeString = '';
            for (const key in attributes) {
                if (key === 'extensions') continue; // Skip extensions array for now
                attributeString += key + ':' + attributes[key] + ';';
            }
            
            // Add a sample of extensions (just first 5 to keep it manageable)
            if (attributes.extensions && attributes.extensions.length > 0) {
                attributeString += 'extensions:' + attributes.extensions.slice(0, 5).join(',') + ';';
            }
            
            // Generate WebGL parameter fingerprint by rendering a test scene
            const parametersFingerprint = this._generateWebGLParametersFingerprint(gl);
            
            // Combine attribute string with parameters fingerprint
            const combinedFingerprint = attributeString + parametersFingerprint;
            
            // Generate hash
            const hash = this._generateHash(combinedFingerprint);
            
            // Store result
            this.fingerprintData.webglHash = hash;
            this.fingerprintData.webglVendor = attributes.unmaskedVendor || attributes.vendor;
            this.fingerprintData.webglRenderer = attributes.unmaskedRenderer || attributes.renderer;
            
            // Display in the UI
            window.utils.addInfo(this.sectionId, 'WebGL Fingerprint Hash', hash);
            window.utils.addInfo(this.sectionId, 'WebGL Vendor', this.fingerprintData.webglVendor);
            window.utils.addInfo(this.sectionId, 'WebGL Renderer', this.fingerprintData.webglRenderer);
            window.utils.addInfo(this.sectionId, 'WebGL Version', attributes.version);
            
            // Add extension count
            if (attributes.extensions) {
                window.utils.addInfo(this.sectionId, 'WebGL Extensions', attributes.extensions.length + ' supported');
            }
            
            return hash;
        } catch (e) {
            window.utils.log('Error generating WebGL fingerprint: ' + e.message, 'error');
            window.utils.addInfo(this.sectionId, 'WebGL Fingerprint', 'Error: ' + e.message);
            return null;
        }
    }
    
    /**
     * Generate a fingerprint from WebGL parameter values
     */
    _generateWebGLParametersFingerprint(gl) {
        // List of WebGL parameters to check
        const parameters = [
            gl.ALPHA_BITS,
            gl.BLUE_BITS,
            gl.DEPTH_BITS,
            gl.GREEN_BITS,
            gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS,
            gl.MAX_CUBE_MAP_TEXTURE_SIZE,
            gl.MAX_FRAGMENT_UNIFORM_VECTORS,
            gl.MAX_RENDERBUFFER_SIZE,
            gl.MAX_TEXTURE_IMAGE_UNITS,
            gl.MAX_TEXTURE_SIZE,
            gl.MAX_VARYING_VECTORS,
            gl.MAX_VERTEX_ATTRIBS,
            gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS,
            gl.MAX_VERTEX_UNIFORM_VECTORS,
            gl.RED_BITS,
            gl.STENCIL_BITS
        ];
        
        let parameterString = '';
        parameters.forEach(parameter => {
            try {
                parameterString += parameter + ':' + gl.getParameter(parameter) + ';';
            } catch (e) {
                // Skip parameters that cause errors
            }
        });
        
        return parameterString;
    }
    
    /**
     * Create a visual representation of the fingerprint
     */
    _createCanvasVisual(dataURL) {
        try {
            // Create a container for the visual
            const section = document.getElementById(this.sectionId);
            if (!section) return;
            
            const visualContainer = document.createElement('div');
            visualContainer.className = 'fingerprint-visual-container';
            visualContainer.style.marginTop = '20px';
            visualContainer.style.marginBottom = '20px';
            
            // Add heading
            const heading = document.createElement('h3');
            heading.textContent = 'Fingerprint Visual Representation';
            heading.style.marginBottom = '10px';
            visualContainer.appendChild(heading);
            
            // Add description
            const description = document.createElement('p');
            description.textContent = 'This is the actual canvas used to generate your fingerprint. Different browsers and devices will render this slightly differently.';
            description.style.marginBottom = '15px';
            visualContainer.appendChild(description);
            
            // Create an image from the data URL
            const img = document.createElement('img');
            img.src = dataURL;
            img.alt = 'Canvas Fingerprint Visual';
            img.style.maxWidth = '100%';
            img.style.border = '1px solid #ddd';
            img.style.borderRadius = '4px';
            visualContainer.appendChild(img);
            
            // Insert the visual container
            const propertyList = section.querySelector('.property-list');
            section.insertBefore(visualContainer, propertyList);
        } catch (e) {
            window.utils.log('Error creating canvas visual: ' + e.message, 'error');
        }
    }
    
    /**
     * Generate a hash from a string
     */
    _generateHash(str) {
        let hash = 0;
        if (str.length === 0) return hash.toString(16);
        
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        
        // Add some additional complexity to the hash
        let hash2 = 0;
        const hashStr = hash.toString(16);
        
        for (let i = 0; i < hashStr.length; i++) {
            const char = hashStr.charCodeAt(i);
            hash2 = ((hash2 << 5) - hash2) + char;
            hash2 = hash2 & hash2;
        }
        
        // Combine the hashes
        const finalHash = (Math.abs(hash) * 31 + Math.abs(hash2)).toString(16);
        return finalHash;
    }
}

// Export the detector
window.CanvasFingerprintDetector = CanvasFingerprintDetector; 