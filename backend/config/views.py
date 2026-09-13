from django.conf import settings
from django.http import FileResponse, Http404


def frontend(request, path=''):
    file_path = settings.FRONTEND_DIST_DIR / path

    if path and file_path.is_file():
        return FileResponse(
            open(file_path, 'rb'),
        )

    index_file = settings.FRONTEND_DIST_DIR / 'index.html'

    if not index_file.exists():
        raise Http404('Frontend build not found')

    return FileResponse(
        open(index_file, 'rb'),
        content_type='text/html',
    )
