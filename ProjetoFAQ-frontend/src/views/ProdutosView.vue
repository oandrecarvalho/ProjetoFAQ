<template>
  <div class="container">
    <div class="bg-[#1a1a1a] rounded-xl shadow-lg overflow-hidden">
      <!-- Cabeçalho -->
      <header>
        <div class="flex items-center justify-between">
          <div>
            <h1 class="title-primary">Produtos Cadastrados</h1>
            <p class="text-gray-400 mt-2 font-['Lora'] text-lg">Lista de produtos disponíveis</p>
          </div>
          <BaseButton @click="showAddModal = true">
            Adicionar Produto
          </BaseButton>
        </div>
      </header>

      <!-- Lista de Produtos -->
      <div class="p-8">
        <div v-if="produtos.length === 0" class="text-center py-12">
          <p class="text-gray-400 text-xl font-['Lora']">Nenhum produto cadastrado</p>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="produto in produtos" :key="produto.id"
            class="bg-[#0a0a0a] rounded-lg overflow-hidden border-2 border-[#00FF88]/20 hover:border-[#00FF88]/40 transition-all duration-300">
            <div class="p-6">
              <div class="flex justify-between items-start mb-4">
                <h3 class="text-xl text-white font-['Playfair_Display']">{{ produto.name }}</h3>
                <span :class="[
                  'px-2 py-1 rounded text-sm font-[\'Lora\']',
                  produto.available
                    ? 'bg-[#00FF88]/20 text-[#00FF88]'
                    : 'bg-red-500/20 text-red-500'
                ]">
                  {{ produto.available ? 'Disponível' : 'sem estoque' }}
                </span>
              </div>

              <p class="text-gray-400 font-['Lora'] mb-4 min-h-[3rem]">
                {{ produto.description }}
              </p>

              <div class="flex justify-between items-center">
                <p class="text-[#00FF88] text-xl font-['Lora']">
                  {{ produto.price }}
                </p>
                <div class="flex space-x-2">
                  <BaseButton variant="secondary" @click="editarProduto(produto)">
                    Editar
                  </BaseButton>
                  <BaseButton variant="secondary" @click="excluirProduto(produto.id)"
                    class="!bg-red-500/10 !text-red-500 hover:!bg-red-500/20">
                    Excluir
                  </BaseButton>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Paginação -->
        <div v-if="totalPages > 1" class="mt-8 flex justify-center items-center space-x-4">
          <BaseButton 
            @click="previousPage" 
            :disabled="currentPage === 1"
            variant="secondary"
          >
            Anterior
          </BaseButton>
          
          <div class="flex items-center space-x-2">
            <button 
              v-for="page in totalPages" 
              :key="page"
              @click="goToPage(page)"
              :class="[
                'px-3 py-1 rounded-lg transition-colors',
                currentPage === page 
                  ? 'bg-[#00FF88] text-[#1a1a1a]' 
                  : 'text-[#00FF88] hover:bg-[#00FF88]/10'
              ]"
            >
              {{ page }}
            </button>
          </div>

          <BaseButton 
            @click="nextPage" 
            :disabled="currentPage === totalPages"
            variant="secondary"
          >
            Próxima
          </BaseButton>
        </div>
      </div>
    </div>

    <!-- Modal de Adicionar/Editar Produto -->
    <div v-if="showAddModal || editingProduto"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-[#1a1a1a] rounded-lg p-8 w-full max-w-2xl relative">
        <h2 class="text-3xl font-semibold text-[#00FF88] font-['Playfair_Display'] tracking-wide mb-8">
          {{ editingProduto ? 'Editar Produto' : 'Novo Produto' }}
        </h2>

        <form @submit.prevent="salvarProduto" class="space-y-6">
          <BaseInput v-model="formData.name" label="Nome do Produto" placeholder="Digite o nome do produto" />

          <BaseInput v-model="formData.description" label="Descrição" placeholder="Digite a descrição do produto"
            tag="textarea" rows="3" />

          <BaseInput 
            v-model="formData.price" 
            label="Preço" 
            placeholder="R$ 0,00"
            @input="handlePrecoInput" />

          <div class="flex items-center space-x-2">
            <input type="checkbox" v-model="formData.available"
              class="w-4 h-4 rounded border-[#00FF88]/20 bg-[#0a0a0a] checked:bg-[#00FF88]">
            <label class="text-white text-lg font-['Lora']">Disponível</label>
          </div>

          <div class="flex justify-end space-x-4 mt-8">
            <BaseButton type="button" variant="secondary" @click="fecharModal">
              Cancelar
            </BaseButton>
            <BaseButton type="submit">
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

    const verificarPermissao = (acao) => {
      if (!hasPermission(acao)) {
        Swal.fire({
          icon: 'error',
          title: 'Acesso Negado',
          text: 'Você não tem permissão para realizar esta ação.',
          confirmButtonColor: '#00FF88',
          background: '#1a1a1a',
          color: '#ffffff'
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
      if (!verificarPermissao('create:product')) return
      editingProduto.value = produto
      formData.value = { ...produto }
      showAddModal.value = true
    }

    const excluirProduto = async (id) => {
      if (!verificarPermissao('delete:product')) return

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
          produtos.value = produtos.value.filter(p => p.id !== id)
          await Swal.fire({
            icon: 'success',
            title: 'Produto excluído!',
            text: 'O produto foi excluído com sucesso.',
            confirmButtonColor: '#00FF88',
            background: '#1a1a1a',
            color: '#ffffff'
          })
        } catch (error) {
          console.error('Erro ao excluir produto:', error)
          await Swal.fire({
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
      if (!verificarAutenticacao()) return
      if (!verificarPermissao('create:product')) return

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
      previousPage
    }
  }
}
</script>

<style scoped>
.title-primary {
  @apply text-4xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#00FF88] to-[#00cc6a] font-['Playfair_Display'] tracking-wide;
}

/* Container principal */
.container {
  @apply max-w-7xl mx-auto px-4 py-12;
}

/* Card principal */
.bg-[#1a1a1a] {
  @apply shadow-xl shadow-[#00FF88]/5 backdrop-blur-sm;
}

/* Cabeçalho */
header {
  @apply p-8 border-b border-[#00FF88]/20 bg-gradient-to-r from-[#1a1a1a] to-[#1a1a1a]/95;
}
</style>