# Sử dụng Node.js image
FROM node:18-alpine

WORKDIR /app

# Copy package.json và cài đặt dependencies
COPY package*.json ./
RUN npm install

# Copy toàn bộ code React
COPY . .

# Build ứng dụng hoặc chạy dev server
# Đối với bài tập lớn, chạy dev server cho tiện:
CMD ["npm", "start"]