// Função para verificar se o usuário está autenticado
export const isAuthenticated = () => {
  const token = localStorage.getItem('token')
  console.log('Token encontrado:', !!token)
  return !!token
}

// Função para verificar se o usuário é admin
export const isAdmin = () => {
  const userRole = localStorage.getItem('userRole')
  console.log('Papel do usuário:', userRole)
  return userRole === 'admin'
}

// Função para verificar permissões específicas
export const hasPermission = (permission) => {
  console.log('Verificando permissão:', permission)

  // Se não estiver autenticado, nega todas as permissões
  if (!isAuthenticated()) {
    console.log('Usuário não autenticado')
    return false
  }

  // Se for admin, permite todas as permissões
  if (isAdmin()) {
    console.log('Usuário é admin, permitindo ação')
    return true
  }

  // Para usuários normais, verifica as permissões específicas
  const userRole = localStorage.getItem('userRole')
  const permissions = {
    user: ['view:question', 'create:question'],
    admin: ['view:product', 'view:question', 'create:product', 'update:product', 'delete:product', 'create:question', 'update:question', 'delete:question', 'answer:question']
  }

  const hasPerm = permissions[userRole]?.includes(permission) || false
  console.log('Permissão concedida:', hasPerm)
  return hasPerm
}

// Função para obter o papel do usuário atual
export const getUserRole = () => {
  const role = localStorage.getItem('userRole') || 'user'
  console.log('Obtendo papel do usuário:', role)
  return role
}

// Função para definir o papel do usuário
export const setUserRole = (role) => {
  console.log('Definindo papel do usuário como:', role)
  localStorage.setItem('userRole', role)
}

// Função para limpar dados de autenticação
export const clearAuth = () => {
  console.log('Limpando dados de autenticação')
  localStorage.removeItem('token')
  localStorage.removeItem('userRole')
  localStorage.removeItem('userEmail')
}

// Função para obter o email do usuário
export const getUserEmail = () => {
  const email = localStorage.getItem('userEmail')
  console.log('Obtendo email do usuário:', email)
  if (!email && isAuthenticated()) {
    // Se não houver email mas houver token, tenta recuperar do token
    const token = localStorage.getItem('token')
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        const emailFromToken = payload.email
        if (emailFromToken) {
          setUserEmail(emailFromToken)
          return emailFromToken
        }
      } catch (e) {
        console.error('Erro ao decodificar token:', e)
      }
    }
  }
  return email
}

// Função para definir o email do usuário
export const setUserEmail = (email) => {
  console.log('Definindo email do usuário como:', email)
  if (email) {
    localStorage.setItem('userEmail', email)
  } else {
    localStorage.removeItem('userEmail')
  }
} 