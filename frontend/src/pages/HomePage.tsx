import { Link } from 'react-router-dom'

export default function HomePage() {
  return (
    <div className="home-page">
      <div className="home-card">
        <h1>My Cloud</h1>

        <p>
          Облачное хранилище для загрузки, хранения и управления файлами.
        </p>

        <nav className="home-actions">
          <Link to="/login">Войти</Link>
          <Link to="/register">Зарегистрироваться</Link>
        </nav>
      </div>
    </div>
  )
}
