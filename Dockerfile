FROM frontend
FROM backend

# Copy frontend application
COPY --from=frontend /usr/share/nginx/html /app/build/static/

ENV STATIC_DIR=/app/build/static/