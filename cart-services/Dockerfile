# ============================================
# Cart Service (Laravel Lumen) - Dockerfile
# ============================================

# Base image PHP CLI
FROM php:8.2-cli

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git unzip zip libzip-dev libpng-dev libonig-dev libxml2-dev \
    && docker-php-ext-install pdo pdo_mysql \
    && rm -rf /var/lib/apt/lists/*

# Install Composer dari official Composer image
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Set working directory di dalam container
WORKDIR /var/www

# 1) Generate project Lumen di /var/www/src
#    Ini akan membuat folder public/, bootstrap/, dll
RUN composer create-project --prefer-dist laravel/lumen:^10.0 src

# Pindah ke folder Lumen project
WORKDIR /var/www/src

# 2) Copy file konfigurasi dan routes dari host ke container
# Copy .env
COPY .env .env

# Copy seluruh folder src/routes dari host ke container
COPY src/routes/web.php routes/web.php

# 3) Optional: jika ada file lain yang ingin disalin, bisa ditambahkan
# COPY src/OtherFolder src/OtherFolder

# Expose port untuk Lumen
EXPOSE 8000

# Jalankan Lumen built-in server
CMD ["php", "-S", "0.0.0.0:8000", "-t", "public"]