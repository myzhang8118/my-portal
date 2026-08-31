module.exports = {
  apps: [
    {
      name: 'my-portal',
      script: './app/backend/app.js',
      cwd: '/srv/projects/my-portal',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '300M',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        JWT_SECRET: '91308e254142297b069860dcf61dd0c820e768837806a1740cd14875937d7b80'
      },
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      error_file: '/srv/projects/my-portal/logs/error.log',
      out_file: '/srv/projects/my-portal/logs/out.log',
      merge_logs: true
    }
  ]
};
