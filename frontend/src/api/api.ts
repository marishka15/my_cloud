export interface User {
  id: number
  username: string
  full_name: string
  email: string
  is_admin: boolean
  file_count: number
  total_size: number
  storage_url?: string
}

export interface CloudFile {
  id: number
  original_name: string
  size: number
  uploaded_at: string
  last_download: string | null
  comment: string
  public_link: string
}

interface ApiError {
  error?: string
}

function getCookie(name: string): string | null {
  const cookies = document.cookie.split(';')

  for (const cookie of cookies) {
    const [key, value] = cookie.trim().split('=')

    if (key === name) {
      return decodeURIComponent(value)
    }
  }

  return null
}

async function ensureCsrfToken() {
  if (!getCookie('csrftoken')) {
    await fetch('/api/csrf/', {
      credentials: 'include',
    })
  }
}

async function request<T>(
  url: string,
  options: RequestInit = {},
): Promise<T> {
  const method = options.method?.toUpperCase() || 'GET'

  if (method !== 'GET' && method !== 'HEAD' && method !== 'OPTIONS') {
    await ensureCsrfToken()
  }

  const headers = new Headers(options.headers)

  if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    const csrfToken = getCookie('csrftoken')

    if (csrfToken) {
      headers.set('X-CSRFToken', csrfToken)
    }
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    const errorData = data as ApiError
    throw new Error(errorData.error || 'Произошла ошибка')
  }

  return data as T
}

export async function login(
  username: string,
  password: string,
) {
  return request<{
    message: string
    user: User
  }>('/api/login/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username,
      password,
    }),
  })
}

export async function register(
  username: string,
  full_name: string,
  email: string,
  password: string,
) {
  return request<{
    message: string
    user: User
  }>('/api/register/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username,
      full_name,
      email,
      password,
    }),
  })
}

export async function getCurrentUser() {
  return request<{ user: User }>('/api/me/')
}

export async function logout() {
  return request<{ message: string }>('/api/logout/', {
    method: 'POST',
  })
}

export async function getFiles(userId?: number) {
  const url = userId
    ? `/api/files/?user_id=${userId}`
    : '/api/files/'

  return request<{
    user_id: number
    files: CloudFile[]
  }>(url)
}

export async function uploadFile(
  file: File,
  comment = '',
  userId?: number,
) {
  const formData = new FormData()

  formData.append('file', file)
  formData.append('comment', comment)

  if (userId) {
    formData.append('user_id', String(userId))
  }

  return request<{
    message: string
    file: CloudFile
  }>('/api/files/upload/', {
    method: 'POST',
    body: formData,
  })
}

export async function updateFile(
  fileId: number,
  data: {
    original_name?: string
    comment?: string
  },
) {
  return request<{ file: CloudFile }>(
    `/api/files/${fileId}/`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    },
  )
}

export async function deleteFile(fileId: number) {
  return request<{ message: string }>(
    `/api/files/${fileId}/delete/`,
    {
      method: 'DELETE',
    },
  )
}

export async function createPublicLink(fileId: number) {
  return request<{ public_link: string }>(
    `/api/files/${fileId}/public-link/`,
    {
      method: 'POST',
    },
  )
}

export function getDownloadUrl(fileId: number) {
  return `/api/files/${fileId}/download/`
}

export function getPublicDownloadUrl(publicLink: string) {
  return `/api/public/${publicLink}/`
}

export async function getUsers() {
  return request<{ users: User[] }>('/api/users/')
}

export async function updateUser(
  userId: number,
  data: {
    is_admin?: boolean
    full_name?: string
    email?: string
  },
) {
  return request<{ user: User }>(
    `/api/users/${userId}/`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    },
  )
}

export async function deleteUser(userId: number) {
  return request<{ message: string }>(
    `/api/users/${userId}/delete/`,
    {
      method: 'DELETE',
    },
  )
}