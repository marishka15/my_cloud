import { useState } from 'react'
import type { SubmitEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from '../store/store'
import { loginUser } from '../store/authSlice'

export default function LoginPage() {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()

  const { loading, error } = useSelector(
    (state: RootState) => state.auth,
  )

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()

    const result = await dispatch(
      loginUser({ username, password }),
    )

    if (loginUser.fulfilled.match(result)) {
      navigate('/files')
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h1>My Cloud</h1>
        <h2>Вход</h2>

        <label>
          Логин
          <input
            value={username}
            onChange={(event) =>
              setUsername(event.target.value)
            }
            required
          />
        </label>

        <label>
          Пароль
          <input
            type="password"
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
            required
          />
        </label>

        {error && (
          <div className="error">
            {error}
          </div>
        )}

        <button disabled={loading}>
          {loading ? 'Входим...' : 'Войти'}
        </button>

        <p>
          Нет аккаунта?{' '}
          <Link to="/register">Зарегистрироваться</Link>
        </p>
      </form>
    </div>
  )
}
