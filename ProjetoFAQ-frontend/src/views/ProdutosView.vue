<template>
  <div class="products-container">
    <div class="products-content">
      <!-- Cabeçalho -->
      <header class="products-header">
        <div class="header-content">
          <div class="header-text">
            <h1 class="title">Produtos Cadastrados</h1>
            <p class="subtitle">Lista de produtos disponíveis</p>
          </div>
          <BaseButton v-if="hasPermission('create:product')" @click="showAddModal = true" class="add-button">
            <i class="fas fa-plus"></i>
            Adicionar Produto
          </BaseButton>
        </div>
      </header>

      <!-- Lista de Produtos -->
      <div class="products-grid">
        <div v-if="produtos.length === 0" class="empty-state">
          <i class="fas fa-box-open"></i>
          <p>Nenhum produto cadastrado</p>
        </div>

        <div v-else class="products-list">
          <div v-for="produto in produtos" :key="produto.id" class="product-card">
            <div class="product-content">
              <div class="product-header">
                <h3 class="product-title">{{ produto.name }}</h3>
                <span :class="[
                  'status-badge',
                  produto.available ? 'status-available' : 'status-unavailable'
                ]">
                  {{ produto.available ? 'Disponível' : 'Sem estoque' }}
                </span>
              </div>

              <p class="product-description">
                {{ produto.description }}
              </p>

              <div class="product-footer">
                <p class="product-price">
                  {{ produto.price }}
                </p>
                <div class="product-actions">
                  <BaseButton v-if="hasPermission('update:product')" variant="secondary" @click="editarProduto(produto)" class="edit-button">
                    <i class="fas fa-edit"></i>
                    Editar
                  </BaseButton>
                  <BaseButton v-if="hasPermission('delete:product')" variant="secondary" @click="excluirProduto(produto.id)" class="delete-button">
                    <i class="fas fa-trash"></i>
                    Excluir
                  </BaseButton>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Paginação -->
        <div v-if="totalPages > 1" class="pagination">
          <BaseButton 
            @click="previousPage" 
            :disabled="currentPage === 1"
            variant="secondary"
            class="pagination-button"
          >
            <i class="fas fa-chevron-left"></i>
            Anterior
          </BaseButton>
          
          <div class="pagination-numbers">
            <button 
              v-for="page in totalPages" 
              :key="page"
              @click="goToPage(page)"
              :class="[
                'page-button',
                currentPage === page ? 'page-button-active' : 'page-button-inactive'
              ]"
            >
              {{ page }}
            </button>
          </div>

          <BaseButton 
            @click="nextPage" 
            :disabled="currentPage === totalPages"
            variant="secondary"
            class="pagination-button"
          >
            Próxima
            <i class="fas fa-chevron-right"></i>
          </BaseButton>
        </div>
      </div>
    </div>

    <!-- Modal de Adicionar/Editar Produto -->
    <div v-if="showAddModal || editingProduto" class="modal-overlay">
      <div class="modal-content">
        <h2 class="modal-title">
          {{ editingProduto ? 'Editar Produto' : 'Novo Produto' }}
        </h2>

        <form @submit.prevent="salvarProduto" class="modal-form">
          <BaseInput v-model="formData.name" label="Nome do Produto" placeholder="Digite o nome do produto" />

          <BaseInput v-model="formData.description" label="Descrição" placeholder="Digite a descrição do produto"
            tag="textarea" rows="3" />

          <BaseInput 
            v-model="formData.price" 
            label="Preço" 
            placeholder="R$ 0,00"
            @input="handlePrecoInput" />

          <div class="availability-toggle">
            <input type="checkbox" v-model="formData.available" id="available" class="toggle-input">
            <label for="available" class="toggle-label">Disponível</label>
          </div>

          <div class="modal-actions">
            <BaseButton type="button" variant="secondary" @click="fecharModal" class="cancel-button">
              Cancelar
            </BaseButton>
            <BaseButton type="submit" class="submit-button">
              {{ editingProduto ? 'Salvar Alterações' : 'Adicionar Produto' }}
            </BaseButton>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import { productService } from '@/services/api'
import Swal from 'sweetalert2'
import { useRouter } from 'vue-router'
import { hasPermission } from '@/services/auth'

export default {
  name: 'ProdutosView',
  components: {
    BaseButton,
    BaseInput
  },
  setup() {
    const router = useRouter()
    const produtos = ref([])
    const showAddModal = ref(false)
    const editingProduto = ref(null)
    const formData = ref({
      name: '',
      description: '',
      price: '',
      available: true
    })

    // Configurações de paginação
    const currentPage = ref(1)
    const itemsPerPage = ref(12) // Número de produtos por página
    const totalItems = ref(0)

    // Computed properties para paginação
    const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage.value))
    const paginatedProducts = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage.value
      const end = start + itemsPerPage.value
      return produtos.value.slice(start, end)
    })

    // Funções de paginação
    const goToPage = (page) => {
      if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page
      }
    }

    const nextPage = () => {
      if (currentPage.value < totalPages.value) {
        currentPage.value++
      }
    }

    const previousPage = () => {
      if (currentPage.value > 1) {
        currentPage.value--
      }
    }

    const verificarAutenticacao = () => {
      const token = localStorage.getItem('token')
      if (!token) {
        Swal.fire({
          icon: 'warning',
          title: 'Atenção',
          text: 'Você precisa estar logado para gerenciar produtos.',
          confirmButtonColor: '#00FF88',
          background: '#1a1a1a',
          color: '#ffffff'
        }).then(() => {
          router.push('/login')
        })
        return false
      }
      return true
    }

    const carregarProdutos = async () => {
      try {
        console.log('Iniciando carregamento de produtos...')
        const response = await productService.getAllProducts()
        console.log('Resposta da API:', response)
        
        if (!response || !response.data) {
          throw new Error('Resposta inválida da API')
        }

        produtos.value = response.data.map(p => ({
          id: p.id,
          name: p.name,
          description: p.description,
          price: p.price,
          available: p.available
        }))
        totalItems.value = produtos.value.length
        console.log('Produtos carregados com sucesso:', produtos.value)
      } catch (error) {
        console.error('Erro detalhado ao carregar produtos:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
          config: error.config
        })
        
        let errorMessage = 'Não foi possível carregar a lista de produtos. '
        if (error.response?.status === 401) {
          errorMessage = 'Você precisa estar logado para visualizar os produtos.'
          router.push('/login')
        } else if (error.response?.status === 404) {
          errorMessage += 'O servidor da API não está respondendo. Verifique se o servidor está online e se a URL está correta.'
        } else if (error.code === 'ECONNABORTED') {
          errorMessage += 'O servidor demorou muito para responder. Tente novamente.'
        } else if (error.response?.status >= 500) {
          errorMessage += 'Erro no servidor. Tente novamente mais tarde.'
        } else if (error.message === 'Network Error') {
          errorMessage += 'Não foi possível conectar ao servidor. Verifique se o servidor está rodando e se a URL está correta.'
        } else {
          errorMessage += 'Por favor, tente novamente.'
        }

        await Swal.fire({
          icon: 'error',
          title: 'Erro ao carregar produtos',
          text: errorMessage,
          confirmButtonColor: '#00FF88',
          background: '#1a1a1a',
          color: '#ffffff'
        })
      }
    }

    const editarProduto = (produto) => {
      if (!hasPermission('update:product')) {
        Swal.fire({
          icon: 'error',
          title: 'Acesso Negado',
          text: 'Você não tem permissão para editar produtos.',
          confirmButtonColor: '#00FF88',
          background: '#1a1a1a',
          color: '#ffffff'
        })
        return
      }
      editingProduto.value = produto
      formData.value = { ...produto }
      showAddModal.value = true
    }

    const excluirProduto = async (id) => {
      if (!hasPermission('delete:product')) {
        Swal.fire({
          icon: 'error',
          title: 'Acesso Negado',
          text: 'Você não tem permissão para excluir produtos.',
          confirmButtonColor: '#00FF88',
          background: '#1a1a1a',
          color: '#ffffff'
        })
        return
      }

      const result = await Swal.fire({
        title: 'Tem certeza?',
        text: "Esta ação não poderá ser revertida!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#00FF88',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sim, excluir!',
        cancelButtonText: 'Cancelar',
        background: '#1a1a1a',
        color: '#ffffff'
      })

      if (result.isConfirmed) {
        try {
          await productService.deleteProduct(id)
          await carregarProdutos()
          Swal.fire({
            icon: 'success',
            title: 'Produto excluído!',
            text: 'O produto foi excluído com sucesso.',
            confirmButtonColor: '#00FF88',
            background: '#1a1a1a',
            color: '#ffffff'
          })
        } catch (err) {
          console.error('Erro ao excluir produto:', err)
          Swal.fire({
            icon: 'error',
            title: 'Erro ao excluir produto',
            text: 'Não foi possível excluir o produto. Por favor, tente novamente.',
            confirmButtonColor: '#00FF88',
            background: '#1a1a1a',
            color: '#ffffff'
          })
        }
      }
    }

    const fecharModal = () => {
      showAddModal.value = false
      editingProduto.value = null
      formData.value = {
        name: '',
        description: '',
        price: '',
        available: true
      }
    }

    const formatarPreco = (valor) => {
      // Remove tudo que não é número ou vírgula
      let numero = valor.replace(/[^\d,]/g, '')
      
      // Garante que só tem uma vírgula
      const partes = numero.split(',')
      if (partes.length > 2) {
        numero = partes[0] + ',' + partes.slice(1).join('')
      }
      
      // Formata como moeda
      if (numero) {
        const numeroFormatado = new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(parseFloat(numero.replace(',', '.')))
        return numeroFormatado
      }
      return ''
    }

    const handlePrecoInput = (event) => {
      const valor = event.target.value
      formData.value.price = formatarPreco(valor)
    }

    const salvarProduto = async () => {
      if (!hasPermission('create:product') && !editingProduto.value) {
        Swal.fire({
          icon: 'error',
          title: 'Acesso Negado',
          text: 'Você não tem permissão para criar produtos.',
          confirmButtonColor: '#00FF88',
          background: '#1a1a1a',
          color: '#ffffff'
        })
        return
      }

      if (editingProduto.value && !hasPermission('update:product')) {
        Swal.fire({
          icon: 'error',
          title: 'Acesso Negado',
          text: 'Você não tem permissão para editar produtos.',
          confirmButtonColor: '#00FF88',
          background: '#1a1a1a',
          color: '#ffffff'
        })
        return
      }

      try {
        // Validação dos campos
        if (!formData.value.name.trim()) {
          await Swal.fire({
            icon: 'error',
            title: 'Erro ao salvar produto',
            text: 'O nome do produto é obrigatório.',
            confirmButtonColor: '#00FF88',
            background: '#1a1a1a',
            color: '#ffffff'
          })
          return
        }

        if (!formData.value.description.trim()) {
          await Swal.fire({
            icon: 'error',
            title: 'Erro ao salvar produto',
            text: 'A descrição do produto é obrigatória.',
            confirmButtonColor: '#00FF88',
            background: '#1a1a1a',
            color: '#ffffff'
          })
          return
        }

        // Formatação do preço
        const precoNumerico = parseFloat(formData.value.price.replace(/[^\d,]/g, '').replace(',', '.'))
        if (isNaN(precoNumerico) || precoNumerico <= 0) {
          await Swal.fire({
            icon: 'error',
            title: 'Erro ao salvar produto',
            text: 'O preço deve ser um valor válido maior que zero.',
            confirmButtonColor: '#00FF88',
            background: '#1a1a1a',
            color: '#ffffff'
          })
          return
        }

        const produtoParaEnviar = {
          ...formData.value,
          price: precoNumerico
        }

        console.log('[ProdutosView] Enviando produto:', produtoParaEnviar)

        if (editingProduto.value) {
          // Editando produto existente
          console.log('[ProdutosView] Atualizando produto:', editingProduto.value.id)
          const response = await productService.updateProduct(editingProduto.value.id, produtoParaEnviar)
          console.log('[ProdutosView] Resposta da atualização:', response)
          
          if (!response || !response.data) {
            throw new Error('Resposta inválida da API')
          }

          const index = produtos.value.findIndex(p => p.id === editingProduto.value.id)
          if (index !== -1) {
            produtos.value[index] = response.data
          }
          await Swal.fire({
            icon: 'success',
            title: 'Produto atualizado!',
            text: 'As alterações foram salvas com sucesso.',
            confirmButtonColor: '#00FF88',
            background: '#1a1a1a',
            color: '#ffffff'
          })
        } else {
          // Adicionando novo produto
          console.log('[ProdutosView] Criando novo produto')
          const response = await productService.createProduct(produtoParaEnviar)
          console.log('[ProdutosView] Resposta da criação:', response)
          
          if (!response || !response.data) {
            throw new Error('Resposta inválida da API')
          }

          produtos.value.push(response.data)
          await Swal.fire({
            icon: 'success',
            title: 'Produto adicionado!',
            text: 'O novo produto foi cadastrado com sucesso.',
            confirmButtonColor: '#00FF88',
            background: '#1a1a1a',
            color: '#ffffff'
          })
        }
        fecharModal()
      } catch (error) {
        console.error('[ProdutosView] Erro ao salvar produto:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
          statusText: error.response?.statusText,
          config: error.config,
          stack: error.stack
        })
        
        let errorMessage = 'Não foi possível salvar o produto. '
        
        if (error.response?.status === 401) {
          errorMessage = 'Você precisa estar logado para realizar esta ação. Por favor, faça login e tente novamente.'
          router.push('/login')
        } else if (error.response?.status === 404) {
          errorMessage += 'O servidor da API não está respondendo. Verifique se o servidor está online e se a URL está correta.'
        } else if (error.code === 'ECONNABORTED') {
          errorMessage += 'O servidor demorou muito para responder. Tente novamente.'
        } else if (error.response?.status >= 500) {
          errorMessage += 'Erro no servidor. Tente novamente mais tarde.'
        } else if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
          errorMessage += 'Não foi possível conectar ao servidor. Verifique se o servidor está rodando e se a URL está correta.'
        } else if (error.response?.data?.message) {
          errorMessage += error.response.data.message
        } else if (error.message) {
          errorMessage += error.message
        } else {
          errorMessage += 'Por favor, tente novamente.'
        }

        await Swal.fire({
          icon: 'error',
          title: 'Erro ao salvar produto',
          text: errorMessage,
          confirmButtonColor: '#00FF88',
          background: '#1a1a1a',
          color: '#ffffff'
        })
      }
    }

    onMounted(() => {
      if (verificarAutenticacao()) {
        carregarProdutos()
      }
    })

    return {
      produtos: paginatedProducts,
      showAddModal,
      editingProduto,
      formData,
      editarProduto,
      excluirProduto,
      fecharModal,
      salvarProduto,
      handlePrecoInput,
      // Adicionar retornos para paginação
      currentPage,
      totalPages,
      itemsPerPage,
      goToPage,
      nextPage,
      previousPage,
      hasPermission
    }
  }
}
</script>

<style scoped>
.products-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  min-height: calc(100vh - 80px);
  background: linear-gradient(to bottom, rgba(26, 26, 26, 0.95), rgba(26, 26, 26, 0.98));
}

.products-content {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 20px;
  padding: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.products-header {
  margin-bottom: 2.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 2px solid rgba(0, 255, 136, 0.1);
  position: relative;
}

.products-header::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 100px;
  height: 2px;
  background: linear-gradient(to right, #00FF88, transparent);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-text {
  flex: 1;
}

.title {
  font-size: 2.5rem;
  color: #fff;
  font-weight: 700;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  letter-spacing: -0.5px;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: rgba(255, 255, 255, 0.6);
  font-size: 1.1rem;
  font-family: 'Lora', serif;
}

.add-button {
  background: linear-gradient(135deg, rgba(0, 255, 136, 0.1), rgba(0, 204, 106, 0.1));
  color: #00FF88;
  border: 1px solid rgba(0, 255, 136, 0.2);
  padding: 0.875rem 1.75rem;
  border-radius: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.add-button:hover {
  background: linear-gradient(135deg, rgba(0, 255, 136, 0.2), rgba(0, 204, 106, 0.2));
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 255, 136, 0.15);
}

.products-grid {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.products-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.product-card {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.3s ease;
  overflow: hidden;
}

.product-card:hover {
  transform: translateY(-2px);
  border-color: rgba(0, 255, 136, 0.2);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.product-content {
  padding: 1.5rem;
}

.product-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.product-title {
  font-size: 1.25rem;
  color: #fff;
  font-weight: 600;
  font-family: 'Playfair Display', serif;
}

.status-badge {
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
}

.status-available {
  background: rgba(0, 255, 136, 0.1);
  color: #00FF88;
}

.status-unavailable {
  background: rgba(255, 68, 68, 0.1);
  color: #ff4444;
}

.product-description {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.95rem;
  line-height: 1.5;
  margin-bottom: 1.5rem;
  min-height: 3rem;
  font-family: 'Lora', serif;
}

.product-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.product-price {
  font-size: 1.25rem;
  color: #00FF88;
  font-weight: 600;
  font-family: 'Lora', serif;
}

.product-actions {
  display: flex;
  gap: 0.75rem;
}

.edit-button, .delete-button {
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.delete-button {
  background: rgba(255, 68, 68, 0.1) !important;
  color: #ff4444 !important;
  border-color: rgba(255, 68, 68, 0.2) !important;
}

.delete-button:hover {
  background: rgba(255, 68, 68, 0.2) !important;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: rgba(255, 255, 255, 0.6);
  font-size: 1.2rem;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 16px;
  border: 2px dashed rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.empty-state:hover {
  border-color: rgba(0, 255, 136, 0.2);
  background: rgba(255, 255, 255, 0.03);
}

.empty-state i {
  font-size: 3rem;
  margin-bottom: 1.5rem;
  color: rgba(0, 255, 136, 0.3);
  filter: drop-shadow(0 2px 4px rgba(0, 255, 136, 0.1));
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.pagination-numbers {
  display: flex;
  gap: 0.5rem;
}

.page-button {
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  transition: all 0.3s ease;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #00FF88;
}

.page-button-active {
  background: #00FF88;
  color: #1a1a1a;
  border-color: #00FF88;
}

.page-button-inactive:hover {
  background: rgba(0, 255, 136, 0.1);
  border-color: rgba(0, 255, 136, 0.2);
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  backdrop-filter: blur(4px);
  animation: fadeIn 0.3s ease;
}

.modal-content {
  background: #1a1a1a;
  border-radius: 20px;
  padding: 2.5rem;
  width: 100%;
  max-width: 32rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  animation: slideIn 0.3s ease;
  position: relative;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-content::-webkit-scrollbar {
  width: 8px;
}

.modal-content::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
}

.modal-content::-webkit-scrollbar-thumb {
  background: rgba(0, 255, 136, 0.2);
  border-radius: 4px;
}

.modal-content::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 255, 136, 0.3);
}

.modal-title {
  font-size: 2rem;
  color: #00FF88;
  font-weight: 600;
  margin-bottom: 2rem;
  font-family: 'Playfair Display', serif;
  text-align: center;
  position: relative;
  padding-bottom: 1rem;
}

.modal-title::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 2px;
  background: linear-gradient(to right, transparent, #00FF88, transparent);
}

.modal-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.availability-toggle {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.3s ease;
}

.availability-toggle:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(0, 255, 136, 0.2);
}

.toggle-input {
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 6px;
  border: 2px solid rgba(0, 255, 136, 0.2);
  background: rgba(10, 10, 10, 0.5);
  appearance: none;
  cursor: pointer;
  position: relative;
  transition: all 0.3s ease;
}

.toggle-input:checked {
  background: #00FF88;
  border-color: #00FF88;
  box-shadow: 0 0 10px rgba(0, 255, 136, 0.3);
}

.toggle-input:checked::after {
  content: '✓';
  position: absolute;
  color: #1a1a1a;
  font-size: 1rem;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.toggle-label {
  color: #fff;
  font-size: 1.1rem;
  font-family: 'Lora', serif;
  font-weight: 500;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.cancel-button, .submit-button {
  padding: 0.875rem 1.75rem;
  border-radius: 12px;
  font-weight: 600;
  transition: all 0.3s ease;
  min-width: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.submit-button {
  background: linear-gradient(135deg, rgba(0, 255, 136, 0.1), rgba(0, 204, 106, 0.1));
  color: #00FF88;
  border: 1px solid rgba(0, 255, 136, 0.2);
}

.submit-button:hover {
  background: linear-gradient(135deg, rgba(0, 255, 136, 0.2), rgba(0, 204, 106, 0.2));
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 255, 136, 0.15);
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideIn {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .products-container {
    padding: 1.5rem;
  }

  .products-content {
    padding: 1.5rem;
  }

  .header-content {
    flex-direction: column;
    gap: 1.5rem;
    align-items: stretch;
  }

  .title {
    font-size: 2rem;
    text-align: center;
  }

  .add-button {
    width: 100%;
    justify-content: center;
  }

  .products-list {
    grid-template-columns: 1fr;
  }

  .modal-content {
    margin: 1rem;
    padding: 1.5rem;
    max-height: 85vh;
  }

  .modal-title {
    font-size: 1.75rem;
    margin-bottom: 1.5rem;
  }

  .modal-form {
    gap: 1.25rem;
  }

  .availability-toggle {
    padding: 0.875rem;
  }

  .modal-actions {
    flex-direction: column;
    gap: 0.75rem;
    margin-top: 1.5rem;
  }

  .cancel-button, .submit-button {
    width: 100%;
    padding: 0.75rem 1.5rem;
  }
}

@media (max-width: 480px) {
  .modal-content {
    margin: 0.75rem;
    padding: 1.25rem;
  }

  .modal-title {
    font-size: 1.5rem;
    margin-bottom: 1.25rem;
  }

  .toggle-label {
    font-size: 1rem;
  }
}
</style>