module.exports = {
  apps: [
    {
      name: 'imenu-admin',
      cwd: './apps/imenu-admin',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3003',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env_production: {
        NODE_ENV: 'production',
        PORT: 3003,
      },
    },
    {
      name: 'imenu-customer-menu',
      cwd: './apps/imenu-customer-menu',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3005',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env_production: {
        NODE_ENV: 'production',
        PORT: 3005,
      },
    },
    {
      name: 'imenu-client-web',
      cwd: './apps/imenu-client-web',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3000',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
  ],
};
