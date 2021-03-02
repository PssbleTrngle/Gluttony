FROM node:12.13.0 as build

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install --no-audit

# Build application
COPY src ./src/
COPY public ./public/
COPY vue.config.js tsconfig.json babel.config.js .browserslistrc .eslintrc.js ./
RUN npm run build

# Serve enviroment
FROM nginx:stable-alpine

# Copy build application
COPY --from=build /app/dist /usr/share/nginx/html

# Copy config file
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]