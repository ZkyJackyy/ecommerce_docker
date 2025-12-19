# gunakan image node versi 18
FROM node:18-alpine

# set working directory di dalam container
WORKDIR /app

# salin file package.json dan package-lock.json
COPY package*.json ./

# install dependensi
RUN npm install

# salin semua file kode ke dalam container
COPY . .

# buat port 4000
EXPOSE 4000

# jalankan aplikasi
CMD ["npm", "start"]