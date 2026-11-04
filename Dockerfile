FROM node:20-slim

WORKDIR /app

# Instalar ffmpeg e ferramentas de build compativeis com ARM64 e x86_64
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
# Garantir instalacao de todas as dependencias necessarias para o build
RUN npm install --include=dev

COPY . .

# Fazer o build dos assets estaticos do React
RUN npm run build

EXPOSE 3000

ENV PORT=3000
ENV NODE_ENV=production

CMD ["npm", "start"]
