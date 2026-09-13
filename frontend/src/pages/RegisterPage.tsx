import { useState } from 'react'
import type { SubmitEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from '../store/store'
import { registerUser } from '../store/authSlice'

export default function RegisterPage() {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const { loading, error } = useSelector(
    (state: RootState) => state.auth,
  )

  const [username, setUsername] = useState('')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()

    const result = await dispatch(
      registerUser({
        username,
        full_name: fullName,
        email,
        password,
      }),
    )

    if (registerUser.fulfilled.match(result)) {
    navigate('/login')
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h1>My Cloud</h1>
        <h2>Регистрация</h2>

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
          Полное имя
          <input
            value={fullName}
            onChange={(event) =>
              setFullName(event.target.value)
            }
            required
          />
        </label>

        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
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
          {loading
            ? 'Регистрируем...'
            : 'Зарегистрироваться'}
        </button>

        <p>
          Уже есть аккаунт?{' '}
          <Link to="/login">Войти</Link>
        </p>
      </form>
    </div>
  )
}
