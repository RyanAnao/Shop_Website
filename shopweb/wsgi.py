import os

from django.core.wsgi import get_wsgi_application

from accounts.views import create_manager

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'shopweb.settings')

# create user with 'manager' role
create_manager()

application = get_wsgi_application()
