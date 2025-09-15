# 1. Use an official Python runtime as a parent image
FROM python:3.9-slim-buster

# 2. Set environment variables to prevent temporary file generation
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# 3. Set the working directory inside the container
WORKDIR /app

# 4. Copy the requirements file first to leverage Docker cache
COPY requirements.txt /app/

# 5. Install the dependencies
RUN pip install --no-cache-dir -r requirements.txt

# 6. Copy the rest of the project files into the container
COPY . /app/

# 7. The command to run the production server (Gunicorn)
CMD ["gunicorn", "backend.wsgi:application"]