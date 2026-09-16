# My Cloud

Облачное хранилище файлов, разработанное в рамках дипломного проекта по профессии «Fullstack-разработчик на Python».

## О проекте

**My Cloud** — веб-приложение для хранения и управления файлами пользователей.

Приложение позволяет:

* регистрировать пользователей;
* выполнять вход и выход из системы;
* управлять личным файловым хранилищем;
* загружать файлы с комментарием;
* просматривать список файлов;
* скачивать файлы;
* переименовывать файлы;
* изменять комментарии к файлам;
* удалять файлы;
* создавать специальные ссылки для доступа к файлам;
* предоставлять администраторам доступ к хранилищам пользователей;
* управлять пользователями через административный интерфейс.

Проект реализован как единое приложение с frontend и backend, размещёнными в одном репозитории.

---

## Технологии

### Backend

* Python 3.10+
* Django 5.2.17
* PostgreSQL
* psycopg2-binary
* python-dotenv

### Frontend

* React 19
* TypeScript
* Redux Toolkit
* React Redux
* React Router
* Vite

### Инструменты

* Git
* GitHub
* Visual Studio Code

---

## Структура проекта

```text
my-cloud/
│
├── backend/
│   ├── config/
│   │   ├── settings.py
│   │   ├── urls.py
│   │   ├── asgi.py
│   │   └── wsgi.py
│   │
│   ├── storage/
│   │   ├── migrations/
│   │   ├── models.py
│   │   ├── urls.py
│   │   └── views.py
│   │
│   ├── file_storage/
│   │
│   ├── manage.py
│   └── requirements.txt
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── store/
│   │   ├── App.tsx
│   │   └── main.tsx
│   │
│   ├── package.json
│   ├── package-lock.json
│   └── vite.config.ts
│
├── .gitignore
└── README.md
```

### Backend

Приложение Django находится в каталоге `backend`.

Основное приложение `storage` отвечает за:

* пользователей;
* аутентификацию;
* административные функции;
* файловые хранилища;
* загрузку и скачивание файлов;
* управление файлами;
* публичные ссылки.

### Frontend

Frontend находится в каталоге `frontend`.

React-приложение содержит страницы авторизации, регистрации, файлового хранилища и административного интерфейса.

Для управления состоянием используется Redux Toolkit, для маршрутизации — React Router.

---

## Требования

Перед установкой проекта необходимо установить:

* Python 3.10 или выше;
* Node.js 18 или выше;
* PostgreSQL;
* Git.

---

# Установка и запуск Backend

## 1. Перейти в каталог backend

Из корневой папки проекта:

```bash
cd backend
```

## 2. Создать виртуальное окружение

Windows:

```bash
python -m venv venv
```

Активировать окружение:

```bash
venv\Scripts\activate
```

Если используется PowerShell:

```powershell
.\venv\Scripts\Activate.ps1
```

## 3. Установить зависимости

```bash
pip install -r requirements.txt
```

---

## Настройка PostgreSQL

Необходимо создать базу данных PostgreSQL для проекта.

Например:

```text
Имя базы данных: my_cloud
Пользователь: postgres
```

Порт PostgreSQL должен соответствовать установленной на компьютере конфигурации.

---

## Настройка переменных окружения

В каталоге `backend` необходимо создать файл:

```text
.env
```

Пример содержимого находится в:

```text
backend/.env.example
```

Пример:

```env
SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=127.0.0.1,localhost

DB_NAME=my_cloud
DB_USER=postgres
DB_PASSWORD=your-database-password
DB_HOST=localhost
DB_PORT=5433
```

Значения переменных необходимо заменить на значения используемой локальной конфигурации.

Файл `.env` не должен публиковаться в репозитории.

---

## 4. Выполнить миграции

Из каталога `backend`:

```bash
python manage.py migrate
```

---

## 5. Создание администратора

При выполнении миграций автоматически применяется data-миграция `storage.0003_create_admin`.

Она создаёт пользователя:

```text
Логин: admin
```
с правами администратора.

Пароль администратора задаётся через переменную окружения:

```env
ADMIN_PASSWORD=your-admin-password
```

Пароль не хранится в исходном коде и не публикуется в репозитории.

Отдельно выполнять команду `createsuperuser` для стандартного развёртывания проекта не требуется.


---

## 6. Проверить настройки Django

```bash
python manage.py check
```

При корректной конфигурации Django должен сообщить:

```text
System check identified no issues (0 silenced).
```

---

## 7. Запустить Backend

```bash
python manage.py runserver
```

По умолчанию Django запускается по адресу:

```text
http://127.0.0.1:8000/
```

API доступен через префикс:

```text
/api/
```

---

# Запуск Frontend

Откройте второй терминал.

Перейдите в каталог frontend:

```bash
cd frontend
```

## 1. Установить зависимости

```bash
npm install
```

## 2. Запустить приложение в режиме разработки

```bash
npm run dev
```

После запуска Vite сообщит адрес приложения, обычно:

```text
http://localhost:5173/
```

Во время локальной разработки запросы к `/api` перенаправляются Vite proxy на Django:

```text
http://127.0.0.1:8000
```

Конфигурация proxy находится в:

```text
frontend/vite.config.ts
```

---

# Сборка Frontend

Для проверки production-сборки:

```bash
npm run build
```

Команда выполняет проверку TypeScript и создаёт production-сборку frontend в каталоге:

```text
frontend/dist/
```

Для предварительного просмотра production-сборки:

```bash
npm run preview
```

---

# Маршруты приложения

Основные маршруты frontend:

| Маршрут     | Назначение                 |
| ----------- | -------------------------- |
| `/`         | Главная страница           |
| `/login`    | Вход в систему             |
| `/register` | Регистрация                |
| `/files`    | Файловое хранилище         |
| `/admin`    | Административный интерфейс |

Доступ к `/files` и `/admin` защищён авторизацией.

Административный интерфейс доступен только пользователям с правами администратора.

---

# API

Backend предоставляет API с префиксом:

```text
/api/
```

Основные группы API:

### Аутентификация

```text
POST /api/register/
POST /api/login/
POST /api/logout/
GET  /api/me/
```

### Пользователи

```text
GET    /api/users/
PATCH  /api/users/<user_id>/
DELETE /api/users/<user_id>/delete/
```

### Файлы

```text
GET    /api/files/
POST   /api/files/upload/
PATCH  /api/files/<file_id>/
DELETE /api/files/<file_id>/delete/
GET    /api/files/<file_id>/download/
POST   /api/files/<file_id>/public-link/
```

### Публичный доступ

```text
GET /api/public/<public_link>/
```

Для обмена данными между frontend и backend используется JSON. Загрузка файлов выполняется через `multipart/form-data`.

---

# Аутентификация

Состояние авторизации пользователя хранится на стороне Django с использованием сессий.

Frontend отправляет запросы с включёнными credentials:

```text
credentials: include
```

Это позволяет использовать сессионную авторизацию Django.

---

# Файловое хранилище

Файлы пользователей сохраняются в каталоге:

```text
backend/file_storage/
```

Базовый путь к файловому хранилищу задаётся в настройках Django.

Для пользователей создаются отдельные каталоги хранения. Файлы сохраняются под уникальными системными именами, при этом в базе данных сохраняется их оригинальное имя.

Для каждого файла в базе данных хранится:

* оригинальное имя;
* размер;
* дата загрузки;
* дата последнего скачивания;
* комментарий;
* путь к файлу;
* специальная публичная ссылка.

Публичная ссылка формируется без использования имени пользователя или оригинального имени файла.

---

# Административный интерфейс

Администратор может:

* просматривать список пользователей;
* видеть информацию о пользователях;
* видеть количество файлов пользователя;
* видеть общий размер файлов пользователя;
* изменять признак администратора;
* удалять пользователей;
* открывать файловое хранилище любого пользователя.

Обычный пользователь имеет доступ только к собственному файловому хранилищу.

---

# Проверка проекта

Перед публикацией или развёртыванием проекта рекомендуется выполнить проверки.

### Backend

```bash
cd backend
python manage.py check
```

### Frontend

```bash
cd frontend
npm run build
```

Обе команды должны завершаться без ошибок.

---

# Переменные окружения

В репозитории не публикуются реальные значения:

* `SECRET_KEY`;
* `DB_PASSWORD`;
* другие конфиденциальные параметры окружения.

Для настройки проекта используется файл:

```text
backend/.env
```

Шаблон переменных находится в:

```text
backend/.env.example
```

---

# Развёртывание

Проект развёрнут на виртуальном сервере Reg.ru с операционной системой Ubuntu.

## Production-окружение

Используются:

* Ubuntu;
* Python 3.10+;
* Django;
* PostgreSQL;
* Node.js и npm;
* React;
* Gunicorn;
* Nginx;
* systemd.

Backend запускается через Gunicorn, управление процессом выполняется с помощью systemd. Nginx принимает внешние HTTP-запросы и передаёт их Django через Gunicorn.

## 1. Подготовка сервера

Подключиться к серверу по SSH и обновить пакеты:

```bash
sudo apt update
sudo apt upgrade -y
```

Установить необходимые компоненты:

```bash
sudo apt install postgresql postgresql-contrib nginx nodejs npm git -y
```

Проверить установленные версии:

```bash
python3 --version
node --version
npm --version
git --version
psql --version
nginx -v
```

## 2. Получение проекта

Клонировать репозиторий:

```bash
git clone https://github.com/marishka15/my_cloud.git
cd my_cloud
```

Backend находится в каталоге:

```text
backend/
```

Frontend находится в каталоге:

```text
frontend/
```

## 3. Создание виртуального окружения Python

Перейти в backend:

```bash
cd backend
```

Создать виртуальное окружение:

```bash
python3 -m venv venv
```

Активировать окружение:

```bash
source venv/bin/activate
```

Установить зависимости:

```bash
pip install -r requirements.txt
```

## 4. Настройка PostgreSQL

Создать пользователя PostgreSQL:

```bash
sudo -u postgres createuser -P mycloud_db
```

Создать базу данных:

```bash
sudo -u postgres createdb -O mycloud_db my_cloud
```

При необходимости проверить подключение:

```bash
sudo -u postgres psql
```

В PostgreSQL пользователь `mycloud_db` должен иметь права владельца базы `my_cloud`.

## 5. Настройка переменных окружения

В каталоге `backend` создать файл:

```text
.env
```

Пример production-конфигурации:

```env
SECRET_KEY=your-production-secret-key
DEBUG=False
ALLOWED_HOSTS=134.0.112.131,127.0.0.1,localhost

DB_NAME=my_cloud
DB_USER=mycloud_db
DB_PASSWORD=your-database-password
DB_HOST=localhost
DB_PORT=5432

ADMIN_PASSWORD=your-admin-password
```

`SECRET_KEY`, `DB_PASSWORD` и `ADMIN_PASSWORD` должны содержать реальные секретные значения и не должны публиковаться в репозитории.

Шаблон переменных окружения находится в:

```text
backend/.env.example
```

## 6. Миграции и создание администратора

Из каталога `backend` выполнить:

```bash
python manage.py migrate
```

Миграции приложения `storage` создают необходимые таблицы.

Последующая data-миграция автоматически создаёт пользователя `admin` с административными правами. Пароль берётся из переменной окружения `ADMIN_PASSWORD`.

Отдельный запуск `createsuperuser` для стандартной настройки проекта не требуется.

Проверить состояние Django:

```bash
python manage.py check
```

## 7. Сборка frontend

Перейти в каталог frontend:

```bash
cd ../frontend
```

Установить зависимости:

```bash
npm install
```

Создать production-сборку:

```bash
npm run build
```

После выполнения команды создаётся каталог:

```text
frontend/dist/
```

Production-сборка frontend используется Django для отдачи пользовательского интерфейса.

## 8. Сборка статических файлов Django

Вернуться в каталог backend:

```bash
cd ../backend
```

Выполнить:

```bash
python manage.py collectstatic --noinput
```

Статические файлы будут собраны в каталог:

```text
backend/staticfiles/
```

## 9. Проверка Gunicorn

Gunicorn используется как WSGI-сервер Django.

Проверить запуск приложения можно командой:

```bash
gunicorn config.wsgi:application --bind 127.0.0.1:8000
```

После проверки процесс можно остановить.

В production Gunicorn запускается автоматически через systemd.

## 10. Настройка systemd

Создать файл:

```text
/etc/systemd/system/mycloud.service
```

Конфигурация:

```ini
[Unit]
Description=My Cloud Django application
After=network.target postgresql.service

[Service]
User=mycloud
Group=mycloud
WorkingDirectory=/home/mycloud/my_cloud/backend
Environment="PATH=/home/mycloud/my_cloud/venv/bin"
ExecStart=/home/mycloud/my_cloud/venv/bin/gunicorn config.wsgi:application --bind 127.0.0.1:8000
Restart=always

[Install]
WantedBy=multi-user.target
```

После создания файла выполнить:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now mycloud
```

Проверить состояние:

```bash
sudo systemctl status mycloud
```

При успешном запуске сервис должен находиться в состоянии:

```text
active (running)
```

## 11. Настройка Nginx

Создать конфигурацию:

```text
/etc/nginx/sites-available/mycloud
```

Используемая конфигурация:

```nginx
server {
    listen 80;
    server_name 134.0.112.131;

    location /static/ {
        alias /home/mycloud/my_cloud/backend/staticfiles/;
    }

    location /file_storage/ {
        alias /home/mycloud/my_cloud/backend/file_storage/;
    }

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Активировать конфигурацию:

```bash
sudo ln -s /etc/nginx/sites-available/mycloud /etc/nginx/sites-enabled/mycloud
```

При необходимости удалить стандартную конфигурацию:

```bash
sudo rm /etc/nginx/sites-enabled/default
```

Проверить конфигурацию:

```bash
sudo nginx -t
```

Перезапустить Nginx:

```bash
sudo systemctl restart nginx
```

Nginx используется как внешний веб-сервер и reverse proxy. Запросы передаются на Gunicorn, а статические файлы Django обслуживаются непосредственно Nginx.

## 12. Проверка production-приложения

Проверить состояние Gunicorn:

```bash
sudo systemctl status mycloud
```

Проверить состояние Nginx:

```bash
sudo systemctl status nginx
```

Проверить Django:

```bash
cd /home/mycloud/my_cloud/backend
source venv/bin/activate
python manage.py check
```

После успешного запуска приложение доступно по адресу:

```text
http://134.0.112.131
```

## 13. Обновление проекта

При изменении проекта получить последнюю версию:

```bash
cd /home/mycloud/my_cloud
git pull
```

При изменении зависимостей:

```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt
```

После изменения моделей выполнить:

```bash
python manage.py migrate
```

После изменения frontend выполнить:

```bash
cd ../frontend
npm install
npm run build
```

После изменений backend перезапустить Gunicorn:

```bash
sudo systemctl restart mycloud
```

При изменении конфигурации Nginx проверить её:

```bash
sudo nginx -t
```

и перезапустить Nginx:

```bash
sudo systemctl restart nginx
```

## 14. Документация

* Gunicorn: https://docs.gunicorn.org/
* Nginx: https://nginx.org/en/docs/
* Django: https://docs.djangoproject.com/
* PostgreSQL: https://www.postgresql.org/docs/
* React: https://react.dev/
* Vite: https://vite.dev/

## 15. Безопасность конфигурации

Файл `.env` не добавляется в Git.

В репозитории отсутствуют реальные значения:

* `SECRET_KEY`;
* `DB_PASSWORD`;
* `ADMIN_PASSWORD`.

Для production используются отдельные значения переменных окружения.

Секретные данные не должны размещаться непосредственно в исходном коде или README.
