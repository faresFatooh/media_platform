from pathlib import Path
import os
import dj_database_url
from datetime import timedelta

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.environ.get('SECRET_KEY', 'django-insecure-fallback-key-for-local-development')

DEBUG = os.environ.get('RENDER') != 'true'

# --- القائمة النهائية للنطاقات المسموح بها ---
ALLOWED_HOSTS = []

# هذا يضيف رابط Render تلقائيًا
RENDER_EXTERNAL_HOSTNAME = os.environ.get('RENDER_EXTERNAL_HOSTNAME')
if RENDER_EXTERNAL_HOSTNAME:
    ALLOWED_HOSTS.append(RENDER_EXTERNAL_HOSTNAME)

# أضف هنا نطاقك الرسمي الخاص بالخادم الخلفي
ALLOWED_HOSTS.append('backend.ghazimortaja.com') 
# ---------------------------------------------

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'corsheaders',
    'rest_framework_simplejwt',
    'users',
    'applications',
    'tasks',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'backend.urls'

TEMPLATES = [ { 'BACKEND': 'django.template.backends.django.DjangoTemplates', 'DIRS': [], 'APP_DIRS': True, 'OPTIONS': { 'context_processors': [ 'django.template.context_processors.debug', 'django.template.context_processors.request', 'django.contrib.auth.context_processors.auth', 'django.contrib.messages.context_processors.messages', ], }, }, ]
WSGI_APPLICATION = 'backend.wsgi.application'
DATABASES = { 'default': dj_database_url.config( default=os.environ.get('DATABASE_URL'), conn_max_age=600 ) }
AUTH_PASSWORD_VALIDATORS = [ { 'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator', }, { 'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator', }, { 'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator', }, { 'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator', }, ]
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True
STATIC_URL = 'static/'
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# --- القائمة النهائية للمصادر المسموح لها بالاتصال ---
CORS_ALLOWED_ORIGINS = []

# هذا يضيف رابط Render الخاص بالواجهة الأمامية تلقائيًا
RENDER_FRONTEND_URL = os.environ.get('RENDER_FRONTEND_URL') 
if RENDER_FRONTEND_URL:
    CORS_ALLOWED_ORIGINS.append(RENDER_FRONTEND_URL)

# أضف هنا نطاقك الرسمي الخاص بالواجهة الأمامية
CORS_ALLOWED_ORIGINS.append('https://ghazimortaja.com')
# ----------------------------------------------------

REST_FRAMEWORK = { 'DEFAULT_AUTHENTICATION_CLASSES': ('rest_framework_simplejwt.authentication.JWTAuthentication',) }
SIMPLE_JWT = { "ACCESS_TOKEN_LIFETIME": timedelta(days=1), "REFRESH_TOKEN_LIFETIME": timedelta(days=7), }

