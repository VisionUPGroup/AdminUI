# Sử dụng Node.js base image
FROM node:20.18-alpine

# Thiết lập thư mục làm việc trong container
WORKDIR /app

# Copy package.json và package-lock.json
COPY package*.json ./

# Cài đặt dependencies
RUN npm install

# Copy toàn bộ mã nguồn vào container
COPY . .

ENV NEXT_PUBLIC_API_URL = https://visionup.azurewebsites.net
# Build ứng dụng Next.js
RUN npm run build

# Expose cổng mặc định của Next.js
EXPOSE 3000

# Khởi động ứng dụng
CMD ["npm", "start"]
