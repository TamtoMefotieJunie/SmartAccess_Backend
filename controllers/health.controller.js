class HealthController {
 
  static checkHealth(req, res) {
    const healthData = {
      status: 'Server is running',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 100) / 100,
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024 * 100) / 100,
        external: Math.round(process.memoryUsage().external / 1024 / 1024 * 100) / 100
      }
    };

    res.status(200).json(healthData);
  }

 
  static getSystemInfo(req, res) {
    const systemInfo = {
      node_version: process.version,
      platform: process.platform,
      arch: process.arch,
      pid: process.pid,
      uptime_seconds: process.uptime(),
      uptime_human: formatUptime(process.uptime()),
      memory_usage: process.memoryUsage(),
      cpu_usage: process.cpuUsage(),
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString()
    };

    res.status(200).json({
      success: true,
      data: systemInfo
    });
  }
}

function formatUptime(seconds) {
  const days = Math.floor(seconds / (24 * 60 * 60));
  const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
  const minutes = Math.floor((seconds % (60 * 60)) / 60);
  const secs = Math.floor(seconds % 60);

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0) parts.push(`${secs}s`);

  return parts.join(' ') || '0s';
}

module.exports = HealthController;
