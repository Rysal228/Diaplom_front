FROM node:18-alpine AS build-stage

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install
RUN npm install jszip
RUN npm install xlsx

COPY . .
RUN npm run build --configuration=production

FROM nginx:alpine

COPY --from=build-stage /usr/src/app/dist/altium-designer/browser /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
