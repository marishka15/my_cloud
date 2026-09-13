import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  useNavigate,
  useSearchParams,
} from 'react-router-dom'
import type { AppDispatch, RootState } from '../store/store'
import { logoutUser } from '../store/authSlice'
import * as api from '../api/api'
import type { CloudFile } from '../api/api'

function formatDate(date: string | null) {
  if (!date) {
    return 'не было'
  }

  return new Date(date).toLocaleString('ru-RU')
}

export default function FilesPage() {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const user = useSelector(
    (state: RootState) => state.auth.user,
  )

  const targetUserId = searchParams.get('user_id')
    ? Number(searchParams.get('user_id'))
    : undefined

  const [files, setFiles] = useState<CloudFile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [selectedFile, setSelectedFile] = useState<File | null>(
    null,
  )
  const [uploadComment, setUploadComment] = useState('')
  const [uploading, setUploading] = useState(false)

  async function loadFiles() {
    try {
      setLoading(true)

      const result = await api.getFiles(targetUserId)

      setFiles(result.files)
      setError('')
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Не удалось загрузить файлы',
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadFiles()
  }, [targetUserId])

  async function handleLogout() {
    await dispatch(logoutUser())
    navigate('/login')
  }

  async function handleUpload() {
    if (!selectedFile) {
      setError('Выберите файл')
      return
    }

    try {
      setUploading(true)
      setError('')

      await api.uploadFile(
        selectedFile,
        uploadComment,
        targetUserId,
      )

      setSelectedFile(null)
      setUploadComment('')

      const fileInput = document.getElementById(
        'file-input',
      ) as HTMLInputElement | null

      if (fileInput) {
        fileInput.value = ''
      }

      await loadFiles()
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Не удалось загрузить файл',
      )
    } finally {
      setUploading(false)
    }
  }

  async function handleDelete(fileId: number) {
    if (!confirm('Удалить файл?')) {
      return
    }

    try {
      await api.deleteFile(fileId)
      await loadFiles()
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Не удалось удалить файл',
      )
    }
  }

  async function handleRename(file: CloudFile) {
    const newName = prompt(
      'Новое имя файла:',
      file.original_name,
    )

    if (!newName) {
      return
    }

    try {
      await api.updateFile(file.id, {
        original_name: newName,
      })

      await loadFiles()
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Не удалось переименовать файл',
      )
    }
  }

  async function handleCommentChange(file: CloudFile) {
    const newComment = prompt(
      'Комментарий к файлу:',
      file.comment,
    )

    if (newComment === null) {
      return
    }

    try {
      await api.updateFile(file.id, {
        comment: newComment,
      })

      await loadFiles()
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Не удалось изменить комментарий',
      )
    }
  }

  async function handleCreatePublicLink(fileId: number) {
    try {
      const result = await api.createPublicLink(fileId)

      await navigator.clipboard.writeText(
        result.public_link,
      )

      alert(
        `Специальная ссылка скопирована:\n${result.public_link}`,
      )
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Не удалось создать специальную ссылку',
      )
    }
  }

  return (
    <div className="page">
      <header className="header">
    <div>
    <h1>My Cloud</h1>

    {user && (
      <span>
        Пользователь: {user.full_name}
      </span>
    )}
    </div>

    <nav>
    <button
      type="button"
      onClick={() => navigate('/files')}
    >
      Мои файлы
    </button>

    {user?.is_admin && (
      <button
        type="button"
        onClick={() => navigate('/admin')}
      >
        Администрирование
      </button>
    )}

    <button
      type="button"
      onClick={handleLogout}
    >
      Выйти
      </button>
      </nav>
     </header>

      <main>
        <h2>
          {targetUserId
            ? 'Хранилище пользователя'
            : 'Мои файлы'}
        </h2>

        {error && (
          <div className="error">
            {error}
          </div>
        )}

            <section className="upload-section">
  <h3>Загрузить файл</h3>

  <div className="upload-field">
    <input
      id="file-input"
      type="file"
      onChange={(event) => {
        setSelectedFile(
          event.target.files?.[0] ?? null,
        )
      }}
    />
  </div>

    <div className="upload-field">
        <input
      type="text"
      placeholder="Комментарий к файлу"
      value={uploadComment}
      onChange={(event) =>
        setUploadComment(event.target.value)}
        />
    </div>

    <button
    type="button"
    onClick={handleUpload}
    disabled={uploading}
    >
    {uploading ? 'Загрузка...' : 'Загрузить'}
    </button>
    </section>
        <hr />

        {loading ? (
          <p>Загрузка...</p>
        ) : files.length === 0 ? (
          <p>Файлов пока нет.</p>
        ) : (
          <div className="file-list">
            {files.map((file) => (
              <div
                className="file-card"
                key={file.id}
              >
                <div>
                  <strong>
                    {file.original_name}
                  </strong>

                  <p>
                    Размер: {file.size} байт
                  </p>

                  <p>
                    Комментарий:{' '}
                    {file.comment || 'нет'}
                  </p>

                  <p>
                    Дата загрузки:{' '}
                    {formatDate(file.uploaded_at)}
                  </p>

                  <p>
                    Последнее скачивание:{' '}
                    {formatDate(file.last_download)}
                  </p>
                </div>

                <div className="file-actions">
                  <a
                    href={api.getDownloadUrl(file.id)}
                  >
                    Скачать
                  </a>

                  <button
                    onClick={() =>
                      handleRename(file)
                    }
                  >
                    Переименовать
                  </button>

                  <button
                    onClick={() =>
                      handleCommentChange(file)
                    }
                  >
                    Изменить комментарий
                  </button>

                  <button
                    onClick={() =>
                      handleCreatePublicLink(file.id)
                    }
                  >
                    Специальная ссылка
                  </button>

                  <button
                    onClick={() =>
                      handleDelete(file.id)
                    }
                  >
                    Удалить
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
