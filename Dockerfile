# Étape 1 : build des fichiers statiques
FROM node:20 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Étape 2 : serveur web pour servir le build (nginx)
FROM nginx:alpine

# Establecer variable de entorno con valor por defecto
ENV VITE_API_URL=http://back:8080

COPY --from=build /app/dist /usr/share/nginx/html
# Copie une config nginx custom si besoin :
COPY default.conf.template /etc/nginx/templates/default.conf.template

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]