import json
import logging
import os
import re
import shutil
import uuid
from pathlib import Path

from django.conf import settings
from django.contrib.auth import authenticate, login, logout
from django.http import FileResponse, JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie
from django.utils import timezone
from django.db import IntegrityError
from .models import File, User


logger = logging.getLogger(__name__)


USERNAME_PATTERN = re.compile(r'^[A-Za-z][A-Za-z0-9]{3,19}$')
PASSWORD_PATTERN = re.compile(
    r'^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{6,}$'
)

@ensure_csrf_cookie
def csrf_token(request):
    return JsonResponse({'message': 'CSRF cookie set'})


def json_body(request):
    try:
        return json.loads(request.body.decode('utf-8'))
    except (json.JSONDecodeError, UnicodeDecodeError):
        return None


def user_to_dict(user, include_storage=False):
    files = File.objects.filter(user=user)

    data = {
        'id': user.id,
        'username': user.username,
        'full_name': user.full_name,
        'email': user.email,
        'is_admin': user.is_admin,
        'file_count': files.count(),
        'total_size': sum(item.size for item in files),
    }

    if include_storage:
        data['storage_url'] = f'/api/files/?user_id={user.id}'

    return data


def error_response(message, status=400):
    return JsonResponse(
        {'error': message},
        status=status,
    )


def require_auth(request):
    if not request.user.is_authenticated:
        return error_response(
            'Требуется авторизация',
            status=401,
        )
    return None


def require_admin(request):
    auth_error = require_auth(request)

    if auth_error:
        return auth_error

    if not request.user.is_admin:
        return error_response(
            'Доступ разрешён только администратору',
            status=403,
        )

    return None


def get_target_user(request):
    user_id = request.GET.get('user_id')

    if not user_id:
        return request.user

    try:
        target_user = User.objects.get(pk=user_id)
    except User.DoesNotExist:
        return None

    if target_user.id != request.user.id and not request.user.is_admin:
        return None

    return target_user


def register(request):
    if request.method != 'POST':
        return error_response('Метод не поддерживается', 405)

    data = json_body(request)

    if data is None:
        return error_response('Некорректный JSON')

    username = str(data.get('username', '')).strip()
    full_name = str(data.get('full_name', '')).strip()
    email = str(data.get('email', '')).strip()
    password = str(data.get('password', ''))

    if not USERNAME_PATTERN.fullmatch(username):
        return error_response(
            'Логин: только латинские буквы и цифры, '
            'первый символ — буква, длина 4–20 символов'
        )

    if not full_name:
        return error_response('Полное имя обязательно')

    email_pattern = r'^[^@\s]+@[^@\s]+\.[^@\s]+$'

    if not re.fullmatch(email_pattern, email):
        return error_response('Некорректный email')

    if not PASSWORD_PATTERN.fullmatch(password):
        return error_response(
            'Пароль должен содержать минимум 6 символов, '
            'заглавную букву, цифру и специальный символ'
        )

    if User.objects.filter(username=username).exists():
        return error_response('Такой логин уже существует', 409)

    if User.objects.filter(email=email).exists():
        return error_response('Такой email уже существует', 409)

    try:
        user = User.objects.create_user(
        username=username,
        email=email,
        full_name=full_name,
        password=password,
        )
    except IntegrityError:
        logger.error(
            'Ошибка создания пользователя %s: конфликт уникальности',
            username,
        )
        return error_response(
            'Пользователь с таким логином или email уже существует',
            409,
        )

    logger.info('Зарегистрирован пользователь %s', user.username)

    return JsonResponse(
        {
            'message': 'Регистрация успешна',
            'user': user_to_dict(user),
        },
        status=201,
    )



def login_view(request):
    if request.method != 'POST':
        return error_response('Метод не поддерживается', 405)

    data = json_body(request)

    if data is None:
        return error_response('Некорректный JSON')

    username = str(data.get('username', '')).strip()
    password = str(data.get('password', ''))

    user = authenticate(
        request,
        username=username,
        password=password,
    )

    if user is None:
        logger.warning(
            'Неуспешная попытка входа пользователя %s',
            username,
        )
        return error_response(
            'Неверный логин или пароль',
            401,
        )

    if not user.is_active:
        return error_response(
            'Пользователь отключён',
            403,
        )

    login(request, user)

    logger.info('Пользователь %s вошёл в систему', user.username)

    return JsonResponse({
        'message': 'Вход выполнен',
        'user': user_to_dict(user),
    })

def current_user(request):
    auth_error = require_auth(request)

    if auth_error:
        return auth_error

    return JsonResponse({
        'user': user_to_dict(request.user),
    })

def users_list(request):
    auth_error = require_admin(request)

    if auth_error:
        return auth_error

    users = User.objects.all().order_by('id')

    return JsonResponse({
        'users': [
            user_to_dict(user, include_storage=True)
            for user in users
        ]
    })

def logout_view(request):
    username = request.user.username if request.user.is_authenticated else 'неавторизованный пользователь'

    logout(request)

    logger.info('Выход из системы: %s', username)

    return JsonResponse({
        'message': 'Выход выполнен',
    })


def user_update(request, user_id):
    auth_error = require_admin(request)

    if auth_error:
        return auth_error

    if request.method != 'PATCH':
        return error_response('Метод не поддерживается', 405)

    try:
        user = User.objects.get(pk=user_id)
    except User.DoesNotExist:
        return error_response('Пользователь не найден', 404)

    data = json_body(request)

    if data is None:
        return error_response('Некорректный JSON')

    if 'is_admin' in data:
        user.is_admin = bool(data['is_admin'])

    if 'full_name' in data:
        user.full_name = str(data['full_name']).strip()

    if 'email' in data:
        email = str(data['email']).strip()

        if User.objects.exclude(pk=user.id).filter(email=email).exists():
            return error_response('Такой email уже существует', 409)

        user.email = email

    user.save()

    logger.info(
        'Администратор %s изменил пользователя %s',
        request.user.username,
        user.username,
    )

    return JsonResponse({
        'user': user_to_dict(user),
    })



def user_delete(request, user_id):
    auth_error = require_admin(request)

    if auth_error:
        return auth_error

    if request.method != 'DELETE':
        return error_response('Метод не поддерживается', 405)

    try:
        user = User.objects.get(pk=user_id)
    except User.DoesNotExist:
        return error_response('Пользователь не найден', 404)

    if user.id == request.user.id:
        return error_response(
            'Нельзя удалить текущего администратора',
            400,
        )

    storage_dir = (
        Path(settings.MY_CLOUD_STORAGE_ROOT)
        / user.storage_path
    )

    if storage_dir.exists():
        shutil.rmtree(storage_dir)

    username = user.username
    user.delete()

    logger.info(
        'Администратор %s удалил пользователя %s',
        request.user.username,
        username,
    )

    return JsonResponse({
        'message': 'Пользователь удалён',
    })


def files_list(request):
    auth_error = require_auth(request)

    if auth_error:
        return auth_error

    target_user = get_target_user(request)

    if target_user is None:
        return error_response(
            'Нет доступа к этому хранилищу',
            403,
        )

    files = File.objects.filter(
        user=target_user
    ).order_by('-uploaded_at')

    return JsonResponse({
        'user_id': target_user.id,
        'files': [
            {
                'id': item.id,
                'original_name': item.original_name,
                'size': item.size,
                'uploaded_at': item.uploaded_at,
                'last_download': item.last_download,
                'comment': item.comment,
                'public_link': item.public_link,
            }
            for item in files
        ],
    })



def file_upload(request):
    auth_error = require_auth(request)

    if auth_error:
        return auth_error

    if request.method != 'POST':
        return error_response('Метод не поддерживается', 405)

    target_user = request.user

    requested_user_id = request.POST.get('user_id')

    if requested_user_id:
        if not request.user.is_admin:
            return error_response('Нет доступа', 403)

        try:
            target_user = User.objects.get(pk=requested_user_id)
        except User.DoesNotExist:
            return error_response('Пользователь не найден', 404)

    uploaded_file = request.FILES.get('file')

    if uploaded_file is None:
        return error_response('Файл не передан')

    comment = request.POST.get('comment', '')

    storage_dir = (
        Path(settings.MY_CLOUD_STORAGE_ROOT)
        / target_user.storage_path
    )

    storage_dir.mkdir(parents=True, exist_ok=True)

    extension = Path(uploaded_file.name).suffix
    unique_name = f'{uuid.uuid4().hex}{extension}'
    file_path = storage_dir / unique_name

    with file_path.open('wb+') as destination:
        for chunk in uploaded_file.chunks():
            destination.write(chunk)

    item = File.objects.create(
        user=target_user,
        original_name=uploaded_file.name,
        size=uploaded_file.size,
        comment=comment,
        file_path=str(file_path.relative_to(settings.MY_CLOUD_STORAGE_ROOT)),
    )

    logger.info(
        'Файл %s загружен пользователем %s',
        item.original_name,
        request.user.username,
    )

    return JsonResponse(
        {
            'message': 'Файл загружен',
            'file': {
                'id': item.id,
                'original_name': item.original_name,
                'size': item.size,
                'comment': item.comment,
                'public_link': item.public_link,
            },
        },
        status=201,
    )



def file_update(request, file_id):
    auth_error = require_auth(request)

    if auth_error:
        return auth_error

    if request.method != 'PATCH':
        return error_response('Метод не поддерживается', 405)

    try:
        item = File.objects.select_related('user').get(pk=file_id)
    except File.DoesNotExist:
        return error_response('Файл не найден', 404)

    if item.user_id != request.user.id and not request.user.is_admin:
        return error_response('Нет доступа', 403)

    data = json_body(request)

    if data is None:
        return error_response('Некорректный JSON')

    if 'original_name' in data:
        new_name = str(data['original_name']).strip()

        if not new_name:
            return error_response('Имя файла не может быть пустым')

        if '/' in new_name or '\\' in new_name or '..' in new_name or '\x00' in new_name:
            return error_response('Недопустимое имя файла')

        item.original_name = new_name

    if 'comment' in data:
        item.comment = str(data['comment'])

    item.save()

    logger.info(
        'Изменён файл %s пользователем %s',
        item.id,
        request.user.username,
    )

    return JsonResponse({
        'file': {
            'id': item.id,
            'original_name': item.original_name,
            'size': item.size,
            'uploaded_at': item.uploaded_at,
            'last_download': item.last_download,
            'comment': item.comment,
            'public_link': item.public_link,
        }
    })



def file_delete(request, file_id):
    auth_error = require_auth(request)

    if auth_error:
        return auth_error

    if request.method != 'DELETE':
        return error_response('Метод не поддерживается', 405)

    try:
        item = File.objects.select_related('user').get(pk=file_id)
    except File.DoesNotExist:
        return error_response('Файл не найден', 404)

    if item.user_id != request.user.id and not request.user.is_admin:
        return error_response('Нет доступа', 403)

    file_path = Path(settings.MY_CLOUD_STORAGE_ROOT) / item.file_path

    if file_path.exists():
        file_path.unlink()

    item.delete()

    logger.info(
        'Удалён файл %s пользователем %s',
        file_id,
        request.user.username,
    )

    return JsonResponse({
        'message': 'Файл удалён',
    })


def file_download(request, file_id):
    auth_error = require_auth(request)

    if auth_error:
        return auth_error

    try:
        item = File.objects.select_related('user').get(pk=file_id)
    except File.DoesNotExist:
        return error_response('Файл не найден', 404)

    if item.user_id != request.user.id and not request.user.is_admin:
        return error_response('Нет доступа', 403)
    
    file_path = Path(settings.MY_CLOUD_STORAGE_ROOT) / item.file_path
    
    if not file_path.exists():
        return error_response('Файл отсутствует на сервере', 404)

    item.last_download = timezone.now()
    item.save(update_fields=['last_download'])

    logger.info(
        'Файл %s скачан пользователем %s',
        file_id,
        request.user.username,
    )

    response = FileResponse(
        open(file_path, 'rb'),
        as_attachment=True,
        filename=item.original_name,
    )

    return response



def create_public_link(request, file_id):
    auth_error = require_auth(request)

    if auth_error:
        return auth_error

    if request.method != 'POST':
        return error_response('Метод не поддерживается', 405)

    try:
        item = File.objects.select_related('user').get(pk=file_id)
    except File.DoesNotExist:
        return error_response('Файл не найден', 404)

    if item.user_id != request.user.id and not request.user.is_admin:
        return error_response('Нет доступа', 403)

    if not item.public_link:
        item.public_link = uuid.uuid4().hex
        item.save(update_fields=['public_link'])

    public_url = request.build_absolute_uri(
        f'/api/public/{item.public_link}/'
    )

    return JsonResponse({
        'public_link': public_url,
    })


def public_download(request, public_link):
    try:
        item = File.objects.get(public_link=public_link)
    except File.DoesNotExist:
        return error_response('Файл не найден', 404)

    file_path = Path(settings.MY_CLOUD_STORAGE_ROOT) / item.file_path

    if not file_path.exists():
        return error_response('Файл отсутствует на сервере', 404)
    
    item.last_download = timezone.now()
    item.save(update_fields=['last_download'])

    logger.info(
        'Файл %s скачан по публичной ссылке',
        item.id,
    )

    return FileResponse(
    open(file_path, 'rb'),
    as_attachment=True,
    filename=item.original_name,
    )

