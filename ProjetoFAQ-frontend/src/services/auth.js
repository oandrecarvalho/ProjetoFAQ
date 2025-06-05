// Função para verificar se o usuário está autenticado
export const isAuthenticated = () => {
  const token = localStorage.getItem('token')
  return !!token
}

// Função para verificar se o usuário é admin
export const isAdmin = () => {
  const userRole = localStorage.getItem('userRole')
  return userRole === 'admin'
}

// Função para verificar permissões específicas
export const hasPermission = (permission) => {
  if (!isAuthenticated()) return false
  
  const userRole = localStorage.getItem('userRole')
  
  // Permissões específicas para cada tipo de usuário
  const permissions = {
    admin: ['create:product', 'delete:product', 'create:question', 'delete:question', 'answer:question'],
    user: ['view:product', 'view:question', 'answer:question']
  }
  
  return permissions[userRole]?.includes(permission) || false
}

// Função para obter o papel do usuário atual
export const getUserRole = () => {
  return localStorage.getItem('userRole') || 'user'
}

// Função para definir o papel do usuário
export const setUserRole = (role) => {
  localStorage.setItem('userRole', role)
}

// Função para limpar dados de autenticação
export const clearAuth = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('userRole')
} 