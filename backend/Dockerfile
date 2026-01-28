FROM python:3.11-slim

WORKDIR /app

COPY backend/requirements.txt .
# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY backend/ .

# Expose port
EXPOSE 5000

# Run the application
CMD ["python", "app.py"]
