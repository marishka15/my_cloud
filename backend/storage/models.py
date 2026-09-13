import uuid

from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models


def generate_storage_path():
    return uuid.uuid4().hex


def generate_public_link():
    return uuid.uuid4().hex


class UserManager(BaseUserManager):
    def create_user(self, username, email, full_name, password=None):
        if not username:
            raise ValueError('Логин обязателен')
        if not email:
            raise ValueError('Email обязателен')

        user = self.model(
            username=username,
            email=self.normalize_email(email),
            full_name=full_name,
        )
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, email, full_name, password=None):
        user = self.create_user(
            username=username,
            email=email,
            full_name=full_name,
            password=password,
        )
        user.is_admin = True
        user.is_staff = True
        user.is_active = True
        user.is_superuser = True
        user.save(using=self._db)
        return user


class User(AbstractBaseUser, PermissionsMixin):
    username = models.CharField(max_length=20, unique=True)
    full_name = models.CharField(max_length=150)
    email = models.EmailField(unique=True)

    is_admin = models.BooleanField(default=False)
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    storage_path = models.CharField(
        max_length=255,
        default=generate_storage_path,
    )

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email', 'full_name']

    objects = UserManager()

    def __str__(self):
        return self.username


class File(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='files',
    )
    original_name = models.CharField(max_length=255)
    size = models.PositiveBigIntegerField()
    uploaded_at = models.DateTimeField(auto_now_add=True)
    last_download = models.DateTimeField(null=True, blank=True)
    comment = models.TextField(blank=True)
    file_path = models.CharField(max_length=500)
    public_link = models.CharField(
        max_length=255,
        unique=True,
        default=generate_public_link,
    )

    def __str__(self):
        return self.original_name
