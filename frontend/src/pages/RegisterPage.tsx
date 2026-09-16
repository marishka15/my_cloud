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
  const [validationError, setValidationError] = useState('')

async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
  event.preventDefault()
  setValidationError('')

  const usernamePattern = /^[A-Za-z][A-Za-z0-9]{3,19}$/
  const passwordPattern =
    /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{6,}$/

  if (!usernamePattern.test(username)) {
    setValidationError(
      'Логин: латинские буквы и цифры, первый символ — буква, длина 4–20 символов',
    )
    return
  }

  if (!fullName.trim()) {
    setValidationError('Полное имя обязательно')
    return
  }

  if (!passwordPattern.test(password)) {
    setValidationError(
      'Пароль должен содержать минимум 6 символов, заглавную букву, цифру и специальный символ',
    )
    return
  }

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

        {validationError && (
          <div className="error">
            {validationError}
          </div>
        )}

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
