FROM serversideup/php:8.4-fpm-nginx

ENV PHP_OPCACHE_ENABLE=1
ENV APP_ENV=production

USER root

# Install Node.js 20 and PHP extensions
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs php-exif \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /var/www/html

COPY --chown=www-data:www-data composer.json composer.lock package.json package-lock.json ./

USER www-data

# Install PHP dependencies
RUN composer install \
    --no-dev \
    --no-interaction \
    --prefer-dist \
    --optimize-autoloader \
    --no-scripts

# Install JS deps
RUN npm install --production=false

# Copy application
COPY --chown=www-data:www-data . .

# Build assets
RUN npm run build \
    && rm -rf node_modules

# Run final composer dump-autoload
RUN composer dump-autoload --optimize

# Permissions
RUN chmod -R 775 storage bootstrap/cache
