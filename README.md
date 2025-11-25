// BackEnd //
-pip install virtualenv
-virtualenv venv --crear entorno virtual ya existente
-.\venv\Scripts\activate --Ingresa al entorno virtual
-python manage.py runserver --Inicializa el proyecto

# Dentro del entorno virtual (solo si no inicializa el proyecto o lanza error)
pip install django
pip install djangorestframework djangorestframework-simplejwt
pip install django-cors-headers
pip install django-environ
pip install pytz pyjwt tzdata
pip install pyotp #En un futuro para un codigo de validacion con tiempo de caducacion
pip install google-api-python-client #Autenticacion con google

// FrontEnd WEB //
-npm run dev --Inicializar el proyecto