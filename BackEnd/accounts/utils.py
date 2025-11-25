import random
from django.core.mail import EmailMessage
from .models import User, OneTimePassword
from django.conf import settings

# Genera un código OTP de 6 dígitos, cada dígito entre 1 y 9
def generateOtp():
    otp = ""
    for i in range(6):
        otp += str(random.randint(1, 9))
    return otp

# Envía un código OTP al correo del usuario para validar su email
def send_code_to_user(email):
    Subject = "Codigo de acceso para validacion de correo"  # Asunto del correo
    otp_code = generateOtp()  # Genera el código OTP
    user = User.objects.get(email=email)  # Obtiene el usuario asociado al email

    current_site = "AgenGlo.com"  # Nombre del sitio o empresa para el cuerpo del correo
    email_body = f"Hola {user.nombre}, gracias por registrarte en {current_site}, por favor, verifique su correo con el codigo de acceso {otp_code}"
    
    from_email = settings.DEFAULT_FROM_EMAIL  # Email configurado para enviar correos
    
    # Crea un registro del código OTP asociado al usuario (para validación posterior)
    OneTimePassword.objects.create(user=user, code=otp_code)
    
    # Prepara y envía el correo electrónico
    send_email = EmailMessage(subject=Subject, body=email_body, from_email=from_email, to=[email])
    send_email.send(fail_silently=True)  # No lanza excepción si falla el envío (mejor loggear el fallo)

# Envía un correo normal con datos genéricos recibidos en un diccionario
def send_normal_email(data):
    email = EmailMessage(
        subject=data['email_subject'],
        body=data['email_body'],
        from_email=settings.EMAIL_HOST_USER,
        to=[data['to_email']]
    )
    email.send()
    
    