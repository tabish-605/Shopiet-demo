# Use a Python slim image
FROM python:3.10.4-slim-bullseye

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Set the working directory in the container
WORKDIR /app

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install python-dotenv

# Copy the Django project code into the container
COPY .env .env
COPY . .

# Expose the port (Cloud Run uses the PORT environment variable)
ENV PORT 8080
EXPOSE $PORT

# Use Uvicorn to serve the Django application
CMD ["sh", "-c", "uvicorn backend.asgi:application --host 0.0.0.0 --port ${PORT}"]
