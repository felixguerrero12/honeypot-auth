/**
 * Network Detector Module
 * Detects network-related information for fingerprinting
 */

class NetworkDetector {
    constructor() {
        this.sectionId = 'network-info';
        this.sectionTitle = 'Network Information';
        this.networkData = {};
    }

    /**
     * Run all network detection tests
     */
    detect() {
        this._createSection();
        this._detectConnectionType();
        this._detectIPInfo();
        this._detectWebRTC();
        
        return this.networkData;
    }

    /**
     * Create the network info section in the DOM
     */
    _createSection() {
        if (window.utils && window.utils.log) {
            window.utils.log('Creating network section', 'info');
        }
        return window.utils.createInfoSection(this.sectionId, this.sectionTitle);
    }

    /**
     * Detect connection type
     */
    _detectConnectionType() {
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        
        if (connection) {
            this.networkData.effectiveType = connection.effectiveType || 'unknown';
            this.networkData.downlink = connection.downlink || 'unknown';
            this.networkData.rtt = connection.rtt || 'unknown';
            this.networkData.saveData = connection.saveData || false;
            
            window.utils.addInfo(this.sectionId, 'Connection Type', this.networkData.effectiveType);
            window.utils.addInfo(this.sectionId, 'Downlink Speed', this.networkData.downlink + ' Mbps');
            window.utils.addInfo(this.sectionId, 'Round Trip Time', this.networkData.rtt + ' ms');
            window.utils.addInfo(this.sectionId, 'Save Data Mode', this.networkData.saveData);
        } else {
            window.utils.addInfo(this.sectionId, 'Connection API', 'Not available in this browser');
        }
    }

    /**
     * Detect IP information (limited due to browser restrictions)
     */
    _detectIPInfo() {
        this.networkData.ipAddressDetection = {
            direct: false,
            message: 'IP address cannot be detected directly with JavaScript for privacy reasons'
        };
        
        window.utils.addInfo(this.sectionId, 'IP Address Detection', 'IP address cannot be detected directly with JavaScript for privacy reasons');
        window.utils.addInfo(this.sectionId, 'IP Detection Method', 'WebRTC can potentially reveal IP addresses (see WebRTC section below)');
    }

    /**
     * Detect WebRTC related information and attempt to get IP addresses
     */
    _detectWebRTC() {
        const webRTCSupported = 'RTCPeerConnection' in window;
        this.networkData.webRTC = {
            supported: webRTCSupported,
            leakageProtection: false,
            addresses: []
        };
        
        window.utils.addInfo(this.sectionId, 'WebRTC Support', webRTCSupported);
        
        if (!webRTCSupported) {
            window.utils.addInfo(this.sectionId, 'WebRTC Status', 'Not supported by this browser');
            return;
        }
        
        // Create IP detection container
        const ipContainer = document.createElement('div');
        ipContainer.className = 'ip-addresses-container';
        
        // Add a loading message
        const loadingMsg = document.createElement('p');
        loadingMsg.textContent = 'Checking for WebRTC IP leakage...';
        loadingMsg.className = 'loading-message';
        ipContainer.appendChild(loadingMsg);
        
        // Add the container to the section
        const ipItem = window.utils.addInfo(this.sectionId, 'WebRTC IP Addresses', ipContainer);
        
        // Use async function to detect IPs
        this._detectWebRTCIPs(ipContainer, ipItem);
    }
    
    /**
     * Detect IP addresses using WebRTC
     * @param {HTMLElement} container - Container to display results
     * @param {HTMLElement} item - The list item containing the container
     */
    async _detectWebRTCIPs(container, item) {
        try {
            const ips = await this._getWebRTCIPs();
            
            // Clear loading message
            container.innerHTML = '';
            
            if (ips.length === 0) {
                const noIPMsg = document.createElement('p');
                noIPMsg.textContent = 'No IP addresses detected via WebRTC (possible protection in place)';
                noIPMsg.className = 'positive-indicator';
                container.appendChild(noIPMsg);
                
                this.networkData.webRTC.leakageProtection = true;
                window.utils.addInfo(this.sectionId, 'WebRTC Leakage Protection', 'Likely protected', 'positive-indicator');
                
            } else {
                const ipList = document.createElement('ul');
                ipList.className = 'ip-list';
                
                ips.forEach(ip => {
                    const ipItem = document.createElement('li');
                    let ipType = this._determineIPType(ip);
                    ipItem.textContent = `${ip} (${ipType})`;
                    ipItem.className = ipType === 'Public' ? 'warning-indicator' : '';
                    ipList.appendChild(ipItem);
                    
                    this.networkData.webRTC.addresses.push({
                        address: ip,
                        type: ipType
                    });
                });
                
                container.appendChild(ipList);
                
                // Add warning if public IP is exposed
                const hasPublicIP = ips.some(ip => this._determineIPType(ip) === 'Public');
                window.utils.addInfo(
                    this.sectionId, 
                    'WebRTC Leakage Status', 
                    hasPublicIP ? 'Public IP exposed via WebRTC' : 'Only local IPs exposed',
                    hasPublicIP ? 'warning-indicator' : 'neutral-indicator'
                );
                
                this.networkData.webRTC.leakageProtection = !hasPublicIP;
            }
            
        } catch (error) {
            container.innerHTML = '';
            const errorMsg = document.createElement('p');
            errorMsg.textContent = `Error detecting WebRTC IPs: ${error.message}`;
            errorMsg.className = 'warning-indicator';
            container.appendChild(errorMsg);
            
            this.networkData.webRTC.error = error.message;
        }
    }
    
    /**
     * Get IP addresses using WebRTC
     * @returns {Promise<string[]>} - Array of detected IP addresses
     */
    _getWebRTCIPs() {
        return new Promise((resolve, reject) => {
            try {
                const ips = [];
                const pc = new RTCPeerConnection({
                    iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
                });
                
                // Create data channel to force ICE candidates
                pc.createDataChannel("");
                
                // Listen for candidate events
                pc.onicecandidate = (event) => {
                    if (event.candidate) {
                        // Extract IP from candidate string
                        const match = /([0-9]{1,3}(\.[0-9]{1,3}){3})/.exec(event.candidate.candidate);
                        if (match && !ips.includes(match[1])) {
                            ips.push(match[1]);
                        }
                    } else {
                        // ICE gathering complete - all candidates received
                        pc.close();
                        resolve(ips);
                    }
                };
                
                // Set timeout in case ICE gathering takes too long
                setTimeout(() => {
                    if (pc.iceConnectionState !== 'closed') {
                        pc.close();
                        resolve(ips);
                    }
                }, 5000);
                
                // Create offer to start ICE gathering
                pc.createOffer()
                    .then(offer => pc.setLocalDescription(offer))
                    .catch(err => reject(err));
                
            } catch (e) {
                reject(e);
            }
        });
    }
    
    /**
     * Determine if an IP address is private or public
     * @param {string} ip - IP address to check
     * @returns {string} - 'Private', 'Public', or 'Special'
     */
    _determineIPType(ip) {
        const parts = ip.split('.');
        
        // Check for private IP ranges
        if (parts[0] === '10') return 'Private'; // 10.0.0.0 - 10.255.255.255
        if (parts[0] === '172' && (parseInt(parts[1], 10) >= 16 && parseInt(parts[1], 10) <= 31)) return 'Private'; // 172.16.0.0 - 172.31.255.255
        if (parts[0] === '192' && parts[1] === '168') return 'Private'; // 192.168.0.0 - 192.168.255.255
        
        // Check for localhost
        if (parts[0] === '127') return 'Localhost'; // 127.0.0.0 - 127.255.255.255
        
        // Check for link-local addresses
        if (parts[0] === '169' && parts[1] === '254') return 'Link-local'; // 169.254.0.0 - 169.254.255.255
        
        // Check for special-use addresses
        if (parts[0] === '0') return 'Special'; // 0.0.0.0 - 0.255.255.255
        if (parts[0] === '100' && (parseInt(parts[1], 10) >= 64 && parseInt(parts[1], 10) <= 127)) return 'Special'; // 100.64.0.0 - 100.127.255.255
        
        // Everything else is assumed to be public
        return 'Public';
    }
}

// Export the detector
window.NetworkDetector = NetworkDetector; 