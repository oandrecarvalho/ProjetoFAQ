<template>
  <div class="question-card">
    <div class="question-header">
      <div class="question-content">
        <p class="question-text">{{ question.question }}</p>
        <div class="question-meta">
          <span>
            <i class="fas fa-user"></i>
            {{ question.autor }}
          </span>
          <span>
            <i class="fas fa-calendar"></i>
            {{ formatDate(question.data) }}
          </span>
        </div>
      </div>
    </div>

    <div v-if="question.answer" class="answer-section">
      <div class="answer-text">{{ question.answer }}</div>
      <div class="answer-meta">
        <i class="fas fa-check-circle"></i>
        Respondida
      </div>
    </div>

    <div class="question-actions">
      <button v-if="canAnswer && !question.answer" class="btn btn-answer" @click="$emit('answer', question.id)">
        <i class="fas fa-reply"></i>
        Responder
      </button>
      <button v-if="canDelete" class="btn btn-delete" @click="$emit('delete', question.id)">
        <i class="fas fa-trash"></i>
        Excluir
      </button>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, onMounted } from 'vue'

const props = defineProps({
  question: {
    type: Object,
    required: true
  },
  canAnswer: {
    type: Boolean,
    default: false
  },
  canDelete: {
    type: Boolean,
    default: false
  }
})

defineEmits(['answer', 'delete'])

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  console.log('QuestionCard montado:', {
    question: props.question,
    canAnswer: props.canAnswer,
    canDelete: props.canDelete
  })
})
</script>

<style scoped>
.question-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.question-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  border-color: rgba(255, 255, 255, 0.2);
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
  gap: 15px;
}

.question-content {
  margin-bottom: 15px;
}

.question-text {
  color: #fff;
  font-size: 1.1em;
  line-height: 1.5;
  margin-bottom: 10px;
  font-weight: 500;
}

.question-meta {
  display: flex;
  align-items: center;
  gap: 15px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9em;
}

.question-meta span {
  display: flex;
  align-items: center;
  gap: 5px;
}

.question-meta i {
  font-size: 1em;
  color: rgba(255, 255, 255, 0.5);
}

.question-actions {
  display: flex;
  gap: 10px;
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.btn {
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 0.9em;
  font-weight: 500;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn i {
  font-size: 1em;
}

.btn-answer {
  background: rgba(0, 255, 136, 0.1);
  color: #00FF88;
  border: 1px solid rgba(0, 255, 136, 0.2);
}

.btn-answer:hover {
  background: rgba(0, 255, 136, 0.2);
  border-color: rgba(0, 255, 136, 0.3);
}

.btn-delete {
  background: rgba(255, 68, 68, 0.1);
  color: #ff4444;
  border: 1px solid rgba(255, 68, 68, 0.2);
}

.btn-delete:hover {
  background: rgba(255, 68, 68, 0.2);
  border-color: rgba(255, 68, 68, 0.3);
}

.answer-section {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.answer-text {
  color: rgba(255, 255, 255, 0.9);
  font-size: 1em;
  line-height: 1.5;
  margin-bottom: 10px;
  padding: 15px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.answer-meta {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.85em;
  display: flex;
  align-items: center;
  gap: 8px;
}

.answer-meta i {
  font-size: 1em;
}

@media (max-width: 640px) {
  .question-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .question-meta {
    flex-wrap: wrap;
  }

  .question-actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
    justify-content: center;
  }
}
</style> 