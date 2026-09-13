import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import type { AppDispatch } from '../store/store'
import { logoutUser } from '../store/authSlice'
import {
  deleteUser,
  getUsers,
  updateUser,
  type User,
} from '../api/api'



function formatSize(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} Б`
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} КБ`
  }

  if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`
  }

  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} ГБ`
}

export default function AdminPage() {
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()

  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function loadUsers() {
    try {
      setLoading(true)
      setError('')

      const data = await getUsers()
      setUsers(data.users)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Не удалось загрузить пользователей',
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  async function handleAdminChange(
    userId: number,
    isAdmin: boolean,
  ) {
    try {
      await updateUser(userId, {
        is_admin: isAdmin,
      })

      await loadUsers()
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Не удалось изменить права пользователя',
      )
    }
  }

  async function handleDelete(user: User) {
    const confirmed = window.confirm(
      `Удалить пользователя "${user.username}"?`,
    )

    if (!confirmed) {
      return
    }

    try {
      await deleteUser(user.id)
      await loadUsers()
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Не удалось удалить пользователя',
      )
    }
  }

  async function handleLogout() {
    await dispatch(logoutUser())
    navigate('/login')
  }

  if (loading) {
    return <p>Загрузка пользователей...</p>
  }

  return (
    <div className="admin-page">
      <header className="admin-header">
        <h1>Пользователи</h1>

      <nav>
      <button
        type="button"
        onClick={() => navigate('/files')}
      >
        Мои файлы
      </button>

      <button
        type="button"
        onClick={handleLogout}
      >
        Выйти
      </button>
      </nav>
      </header>

      <main className="admin-main">

      {error && (
        <div className="admin-error">
            {error}
        </div>
      )}

      {users.length === 0 ? (
        <p>Пользователей нет.</p>
      ) : (
        <div className="admin-table-wrapper">
            <table className="admin-table">
          <thead>
            <tr>
              <th>Логин</th>
              <th>Имя</th>
              <th>Email</th>
              <th>Администратор</th>
              <th>Файлы</th>
              <th>Размер</th>
              <th>Хранилище</th>
              <th>Действия</th>
            </tr>
          </thead>

          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.username}</td>
                <td>{user.full_name}</td>
                <td>{user.email}</td>

                <td>
                  <input
                    type="checkbox"
                    checked={user.is_admin}
                    onChange={(event) =>
                      handleAdminChange(
                        user.id,
                        event.target.checked,
                      )
                    }
                  />
                </td>

                <td>{user.file_count}</td>
                <td>{formatSize(user.total_size)}</td>

                <td>
                  <Link to={`/files?user_id=${user.id}`}>
                    Открыть
                  </Link>
                </td>

                <td>
                  <button
                    type="button"
                    onClick={() => handleDelete(user)}
                  >
                    Удалить
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      )}
    </main>
    </div>
  )
}
