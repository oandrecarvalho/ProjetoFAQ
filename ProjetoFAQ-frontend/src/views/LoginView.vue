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
          <button type="submit" class="btn" :disabled="isLoading">Entrar</button>
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
          <button type="submit" class="btn">Registrar</button>
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
import { setUserRole } from '@/services/auth'

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
      error: null
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
      this.isLoading = true
      this.error = null

      try {
        const response = await authService.login(this.formData)
        localStorage.setItem('token', response.data.token)
        // Define o papel do usuário como 'user' por padrão
        setUserRole('user')
        this.$router.push('/')
      } catch (err) {
        this.error = err.response?.data?.message || 'Erro ao fazer login'
        console.error('Login error:', err)
      } finally {
        this.isLoading = false
      }
    },
    handleRegister() {
      // Implementar lógica de registro
      console.log('Register attempt:', this.registerForm)
      // Após registro bem-sucedido:
      this.isRegister = false
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
</style>
