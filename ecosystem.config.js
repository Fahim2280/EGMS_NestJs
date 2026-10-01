module.exports = {
  apps: [
    {
      name: 'egms-portal',
      script: 'dist/main.js',
      instances: 'max', // Utilizes all available CPU cores in cluster mode
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
  ],
};
