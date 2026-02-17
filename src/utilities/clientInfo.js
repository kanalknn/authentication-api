const UAParser = require('ua-parser-js');

/**
 * Extracts and parses client information from the request
 * @param {Object} req - Express request object
 * @returns {Object} - Parsed client info (ip, userAgent, deviceType, browser, os)
 */
const getClientInfo = (req) => {
    // Get IP address
    // Check for X-Forwarded-For header (useful if behind proxy/load balancer)
    // or fall back to connection remoteAddress
    let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';

    // If multiple IPs in x-forwarded-for, take the first one
    if (ip.includes(',')) {
        ip = ip.split(',')[0].trim();
    }

    // Handle IPv6 mapped IPv4 addresses (::ffff:127.0.0.1)
    if (ip.startsWith('::ffff:')) {
        ip = ip.substring(7);
    }

    // Get User Agent
    const userAgent = req.headers['user-agent'] || '';

    // Parse User Agent
    const parser = new UAParser(userAgent);
    const result = parser.getResult();

    // Determine device type (mobile, tablet, console, smarttv, wearable, embedded)
    // If undefined, assume desktop/laptop or unknown
    const deviceType = result.device.type || 'desktop';

    return {
        ip,
        userAgent,
        deviceType,
        browser: `${result.browser.name || 'Unknown'} ${result.browser.version || ''}`.trim(),
        os: `${result.os.name || 'Unknown'} ${result.os.version || ''}`.trim()
    };
};

module.exports = {
    getClientInfo
};
