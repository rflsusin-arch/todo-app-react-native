# ================================
# ESTÁGIO 1 — Build com Node.js
# ================================
FROM node:20-alpine AS builder

WORKDIR /app

# Instala dependências do sistema necessárias para o Expo
RUN apk add --no-cache python3 make g++

# Copia dependências e instala
COPY package.json package-lock.json* ./
RUN npm install

# Copia o código e gera o build web
COPY . .

# Instala dependências necessárias para o build web
RUN npx expo install react-dom react-native-web

# Gera o build web
RUN npx expo export -p web

# ================================
# ESTÁGIO 2 — Servidor com NGINX
# ================================
FROM nginx:alpine

# Remove configuração padrão
RUN rm /etc/nginx/conf.d/default.conf

# Copia os arquivos gerados pelo Expo (pasta dist) para o NGINX
COPY --from=builder /app/dist /usr/share/nginx/html

# Configuração do NGINX para SPA (Single Page Application)
RUN printf 'server {\n\
    listen 80;\n\
    root /usr/share/nginx/html;\n\
    index index.html;\n\
    include /etc/nginx/mime.types;\n\
    location /_expo/static/ {\n\
        include /etc/nginx/mime.types;\n\
        alias /usr/share/nginx/html/_expo/static/;\n\
    }\n\
    location /assets/ {\n\
        include /etc/nginx/mime.types;\n\
        alias /usr/share/nginx/html/assets/;\n\
    }\n\
    location / {\n\
        try_files $uri $uri/ /index.html;\n\
    }\n\
}\n' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
