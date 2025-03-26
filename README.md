# Browser Enumeration Tool

A simple JavaScript-based tool that collects and displays detailed information about the user's browser environment.

## Features

This tool enumerates the following browser information:

1. **Operating System**
   - Platform detection
   - OS name and version
   - User agent details

2. **Browser Type and Version**
   - Browser name and version
   - Browser engine information
   - Language and cookie settings

3. **Graphics Hardware and Drivers**
   - GPU vendor and renderer
   - WebGL support and version
   - Screen resolution and color depth
   - Supported WebGL extensions

4. **Font Rendering Systems**
   - Available system fonts
   - Font smoothing detection
   - CSS font feature support

5. **Hardware Acceleration Settings**
   - WebGL and WebGL2 support
   - Hardware concurrency
   - CSS 3D transform support
   - Canvas performance metrics

6. **CSS Media Query Color Depth Detection**
   - Precise color depth detection using CSS media queries
   - RDP (Remote Desktop Protocol) connection detection
   - Comparison between JavaScript and CSS-detected color depth

7. **Accessibility Preferences**
   - Reduced motion preference detection
   - Color scheme preference (light/dark mode)
   - Contrast preference detection
   - Forced colors mode detection (Windows high contrast)
   - Visual demonstration of reduced motion effects

## Usage

1. Simply open the `index.html` file in your browser.
2. The tool will automatically run and display all the information.
3. A debug console at the bottom shows the progress of the enumeration process.

## RDP Detection

The tool includes a feature to detect if a user is connecting via Remote Desktop Protocol (RDP):

- RDP typically limits color depth to 5 bits per color or less
- The tool uses CSS media queries to detect the exact color depth
- If color depth is 5 bits or less, the tool will indicate a likely RDP connection
- This detection method is heuristic and may not be 100% accurate in all scenarios

## Accessibility Detection

The tool can detect various accessibility settings that users have configured in their operating system:

- **Reduced Motion**: Detects if the user has enabled settings to reduce animations and motion
- **Color Scheme**: Identifies if the user prefers dark or light color themes
- **Contrast Preferences**: Detects if the user has requested higher contrast
- **Forced Colors**: Identifies if high contrast mode is active (primarily on Windows)

The accessibility section includes a visual demonstration that respects the user's motion preferences, showing how websites should adapt to these settings.

## Potential Issues

Some browser information might not be available due to:

1. **Browser Privacy Settings**: Some browsers restrict access to certain hardware information.
2. **Security Restrictions**: WebGL renderer information might be limited in some browsers.
3. **Browser Compatibility**: Newer APIs might not be available in older browsers.
4. **CSS Media Query Support**: The color depth and accessibility detection requires support for specific CSS media queries.

## Debugging

If you encounter issues:

1. Check the browser console (F12) for any JavaScript errors.
2. Look at the debug console section at the bottom of the page for specific error messages.
3. Some browsers may require enabling WebGL or hardware acceleration in their settings.
4. Not all browsers support the CSS media query features used for color depth and accessibility detection.

## Privacy Note

This tool is intended for local use and diagnostic purposes. The information collected stays in your browser and is not sent anywhere.

## Browser Compatibility

This tool works best in modern browsers like:
- Chrome
- Firefox
- Edge
- Safari

Internet Explorer has limited support for some of the features.

The CSS media query features (color depth detection and accessibility preferences) may not work in all browsers, as they depend on support for specific media features like `min-color`, `max-color`, and `prefers-reduced-motion`. 