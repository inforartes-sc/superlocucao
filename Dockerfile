FROM node:20-alpine

WORKDIR /app

# Instalar ffmpeg do sistema para manipulacao de audio com maxima performance
RUN apk add --no-cache ffmpeg python3 make g++

COPY package*.json ./
RUN npm install

COPY . .

# Fazer o build do frontend React com Vite
RUN npm run build

EXPOSE 3000

ENV PORT=3000
ENV NODE_ENV=production

CMD ["npm", "start"]
