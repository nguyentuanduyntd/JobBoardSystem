# Sử dụng Node.js image
FROM node:22-alpine

WORKDIR /app

# Copy package.json và cài đặt dependencies
COPY package*.json ./
RUN npm install

# Copy toàn bộ code React
COPY . .

# Build ứng dụng hoặc chạy dev server

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]