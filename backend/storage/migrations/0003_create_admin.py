import os

from django.db import migrations


def create_admin(apps, schema_editor):
    User = apps.get_model('storage', 'User')

    if User.objects.filter(username='admin').exists():
        return

    password = os.environ.get('ADMIN_PASSWORD')

    if not password:
        raise RuntimeError(
            'ADMIN_PASSWORD is not set. '
            'Add it to the environment before running migrations.'
        )

    user = User(
        username='admin',
        email='admin@example.com',
        full_name='Administrator',
        is_admin=True,
        is_staff=True,
        is_active=True,
        is_superuser=True,
    )
    user.set_password(password)
    user.save()


def remove_admin(apps, schema_editor):
    User = apps.get_model('storage', 'User')
    User.objects.filter(username='admin').delete()


class Migration(migrations.Migration):

    dependencies = [
        (
            'storage',
            '0002_user_groups_user_is_superuser_user_user_permissions_and_more',
        ),
    ]

    operations = [
        migrations.RunPython(create_admin, remove_admin),
    ]
