FROM node:20-slim

WORKDIR /app

# Instalar ffmpeg e certificados SSL
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY package.json ./
COPY .npmrc* ./

# Instalar dependencias limpas diretamente para a arquitetura do servidor (ARM64)
RUN npm install --legacy-peer-deps

COPY . .

# Build da aplicacao web
RUN npm run build

EXPOSE 3000

ENV PORT=3000
ENV NODE_ENV=production

CMD ["npm", "start"]
