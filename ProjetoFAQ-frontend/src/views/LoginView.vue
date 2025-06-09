<template>
  <div class="min-h-screen flex justify-center items-center bg-cover bg-center"
    :style="{ backgroundImage: `url(${backgroundImage})` }">
    <div class="wrapper" :class="{ active: isRegister }">
      <!-- Login Form -->
      <div class="form-box login">
        <h2>Entrar</h2>
        <form @submit.prevent="handleLogin">
          <div class="input-box">
            <span class="icon"><i class="fas fa-user"></i></span>
            <input type="text" v-model="formData.email" required>
            <label>Nome de usuário</label>
          </div>
          <div class="input-box">
            <span class="icon"><i class="fas fa-lock"></i></span>
            <input type="password" v-model="formData.password" required>
            <label>Senha</label>
          </div>
          <div v-if="error" class="error-message">
            {{ error }}
          </div>
          <button type="submit" class="btn" :disabled="isLoading">
            {{ isLoading ? 'Entrando...' : 'Entrar' }}
          </button>
          <div class="login-register">
            <p>Não tem uma conta? <a href="#" class="register-link" @click.prevent="toggleForm">Registrar</a></p>
          </div>
        </form>
      </div>

      <!-- Register Form -->
      <div class="form-box register">
        <h2>Registro</h2>
        <form @submit.prevent="handleRegister">
          <div class="input-box">
            <span class="icon"><i class="fas fa-user"></i></span>
            <input type="text" v-model="registerForm.username" required>
            <label>Nome de usuário</label>
          </div>
          <div class="input-box">
            <span class="icon"><i class="fas fa-lock"></i></span>
            <input type="password" v-model="registerForm.password" required>
            <label>Senha</label>
          </div>
          <div v-if="registerError" class="error-message">
            {{ registerError }}
          </div>
          <div v-if="registerSuccess" class="success-message">
            {{ registerSuccess }}
          </div>
          <button type="submit" class="btn" :disabled="isRegisterLoading">
            {{ isRegisterLoading ? 'Registrando...' : 'Registrar' }}
          </button>
          <div class="login-register">
            <p>Já tem uma conta? <a href="#" class="login-link" @click.prevent="toggleForm">Entrar</a></p>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import backgroundImage from '@/assets/images/fundo.png'
import { authService } from '@/services/api'
import { setUserEmail } from '@/services/auth'

export default {
  name: 'LoginView',
  data() {
    return {
      isRegister: false,
      formData: {
        email: '',
        password: ''
      },
      registerForm: {
        username: '',
        password: ''
      },
      backgroundImage,
      isLoading: false,
      error: null,
      isRegisterLoading: false,
      registerError: null,
      registerSuccess: null
    }
  },
  methods: {
    toggleForm() {
      this.isRegister = !this.isRegister
    },
    closeForm() {
      this.isRegister = false
      this.$router.push('/')
    },
    async handleLogin() {
      console.log('Iniciando login...');
      this.isLoading = true
      this.error = null

      try {
        const response = await authService.login(this.formData)
        console.log('Resposta da API:', response.data);
        localStorage.setItem('token', response.data.token)
        setUserEmail(this.formData.email)
        // Não precisamos definir o papel do usuário aqui, pois já foi definido no authService.login
        this.$router.push('/produtos')
      } catch (err) {
        console.error('Login error:', err)
        if (err.response?.status === 401) {
          this.error = 'Senha incorreta. Por favor, tente novamente.'
        } else if (err.response?.status === 404) {
          this.error = 'Usuário não encontrado.'
        } else {
          this.error = err.response?.data?.message || 'Erro ao fazer login. Por favor, tente novamente.'
        }
      } finally {
        this.isLoading = false
      }
    },
    async handleRegister() {
      this.isRegisterLoading = true
      this.registerError = null
      this.registerSuccess = null

      try {
        const response = await authService.register(this.registerForm)
        console.log('Registro bem-sucedido:', response.data)
        
        this.registerSuccess = 'Usuário criado com sucesso! Você já pode fazer login.'
        this.registerForm = {
          username: '',
          password: ''
        }
        
        // Limpa a mensagem de sucesso após 3 segundos
        setTimeout(() => {
          this.registerSuccess = null
          this.isRegister = false
        }, 3000)
      } catch (err) {
        console.error('Erro no registro:', err)
        this.registerError = err.response?.data?.message || 'Erro ao criar usuário. Por favor, tente novamente.'
      } finally {
        this.isRegisterLoading = false
      }
    }
  }
}
</script>

<style scoped>
.wrapper {
  position: relative;
  width: 400px;
  height: 440px;
  background: rgba(10, 10, 10, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  backdrop-filter: blur(10px);
  box-shadow: 0 0 30px rgba(0, 0, 0, 0.3);
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  transition: height 0.2s ease;
}

.wrapper.active {
  height: 520px !important;
}

.wrapper .form-box {
  width: 100%;
  padding: 40px;
}

.wrapper .form-box.login {
  transition: transform 0.18s ease;
  transform: translateX(0);
}

.wrapper.active .form-box.login {
  transition: none;
  transform: translateX(-400px);
}

.wrapper .form-box.register {
  position: absolute;
  transition: none;
  transform: translateX(400px);
}

.wrapper.active .form-box.register {
  transition: transform 0.18s ease;
  transform: translateX(0);
}

.wrapper .icon-close {
  position: absolute;
  top: 0;
  right: 0;
  width: 45px;
  height: 45px;
  background: rgba(10, 10, 10, 0.8);
  font-size: 2em;
  color: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
  border-bottom-left-radius: 20px;
  cursor: pointer;
  z-index: 1;
  transition: all 0.3s ease;
}

.wrapper .icon-close:hover {
  background: rgba(255, 255, 255, 0.1);
}

.form-box h2 {
  font-size: 2em;
  color: #fff;
  text-align: center;
  margin-bottom: 30px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.input-box {
  position: relative;
  width: 100%;
  height: 50px;
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
  margin: 30px 0;
  transition: all 0.3s ease;
}

.input-box:focus-within {
  border-bottom-color: rgba(255, 255, 255, 0.3);
}

.input-box label {
  position: absolute;
  top: 50%;
  left: 5px;
  transform: translateY(-50%);
  font-size: 1em;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
  pointer-events: none;
  transition: 0.5s;
}

.input-box input:focus~label,
.input-box input:valid~label {
  top: -5px;
  color: #fff;
}

.input-box input {
  width: 100%;
  height: 100%;
  background: transparent;
  border: none;
  outline: none;
  font-size: 1em;
  color: #fff;
  font-weight: 600;
  padding: 0 35px 0 5px;
}

.input-box .icon {
  position: absolute;
  right: 8px;
  font-size: 1.2em;
  color: rgba(255, 255, 255, 0.8);
  line-height: 57px;
  transition: all 0.3s ease;
}

.input-box:focus-within .icon {
  color: #fff;
}

.btn {
  width: 100%;
  height: 45px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  outline: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1em;
  color: #fff;
  font-weight: 500;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.btn:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.login-register {
  font-size: 0.9em;
  color: rgba(255, 255, 255, 0.8);
  text-align: center;
  font-weight: 500;
  margin: 25px 0 10px;
}

.login-register p a {
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
}

.login-register p a:hover {
  color: #fff;
  text-decoration: underline;
}

.error-message {
  color: #ff4444;
  background-color: rgba(255, 68, 68, 0.1);
  border: 1px solid rgba(255, 68, 68, 0.3);
  padding: 10px;
  border-radius: 6px;
  margin: 10px 0;
  text-align: center;
  font-size: 0.9em;
}

.success-message {
  color: #00FF88;
  font-size: 0.9em;
  margin: 10px 0;
  text-align: center;
}
</style>
