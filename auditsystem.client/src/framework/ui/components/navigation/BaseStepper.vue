<!-- src/framework/ui/components/navigation/BaseStepper.vue -->
<template>
  <div class="base-stepper" :class="stepperClasses">
    <!-- Steps -->
    <div class="base-stepper__steps">
      <div v-for="(step, index) in steps"
           :key="step.id"
           class="base-stepper__step"
           :class="getStepClass(step)">

        <!-- Step connector -->
        <div v-if="index > 0" class="base-stepper__connector" />

        <!-- Step content -->
        <div class="base-stepper__step-content">
          <!-- Step indicator -->
          <div class="base-stepper__indicator">
            <!-- Completed step -->
            <div v-if="step.status === 'completed'" class="base-stepper__indicator-completed">
              <CheckIcon :size="16" />
            </div>

            <!-- Current step -->
            <div v-else-if="step.status === 'current'" class="base-stepper__indicator-current">
              {{ index + 1 }}
            </div>

            <!-- Pending step -->
            <div v-else class="base-stepper__indicator-pending">
              {{ index + 1 }}
            </div>
          </div>

          <!-- Step label -->
          <div class="base-stepper__label">
            <div class="base-stepper__title">
              {{ step.title }}
            </div>
            <div v-if="step.description" class="base-stepper__description">
              {{ step.description }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Step content -->
    <div class="base-stepper__content">
      <slot :name="currentStep?.id" :step="currentStep" :index="currentIndex">
        <div v-if="currentStep?.component" class="base-stepper__component">
          <component :is="currentStep.component" v-bind="currentStep.props" />
        </div>
      </slot>
    </div>

    <!-- Navigation -->
    <div v-if="showNavigation" class="base-stepper__navigation">
      <BaseButton :disabled="!hasPrev"
                  @click="goToPrev"
                  variant="secondary">
        Назад
      </BaseButton>

      <div class="base-stepper__navigation-right">
        <BaseButton v-if="hasNext"
                    @click="goToNext"
                    :loading="nextLoading">
          Продолжить
        </BaseButton>

        <BaseButton v-else
                    @click="handleComplete"
                    :loading="completeLoading">
          {{ completeText }}
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref, watch } from 'vue'
  import { CheckIcon } from '@/assets/icons'
  import BaseButton from '../buttons/BaseButton.vue'
  import type { Component } from 'vue';

  interface Step {
    id: string
    title: string
    description?: string
    status?: 'completed' | 'current' | 'pending' | 'error'
    component?: Component
    props?: Record<string, unknown>
    disabled?: boolean
    validate?: () => boolean | Promise<boolean>
  }

  interface Props {
    modelValue: string
    steps: Step[]
    orientation?: 'horizontal' | 'vertical'
    showNavigation?: boolean
    linear?: boolean
    completeText?: string
  }

  const props = withDefaults(defineProps<Props>(), {
    orientation: 'horizontal',
    showNavigation: true,
    linear: true,
    completeText: 'Завершить',
  })

  const emit = defineEmits<{
    'update:modelValue': [stepId: string]
    'change': [stepId: string, previousStepId: string]
    'complete': []
  }>()

  const nextLoading = ref(false)
  const completeLoading = ref(false)

  const currentStepId = ref(props.modelValue)
  const currentIndex = computed(() => props.steps.findIndex(step => step.id === currentStepId.value))
  const currentStep = computed(() => props.steps[currentIndex.value])

  const hasPrev = computed(() => currentIndex.value > 0)
  const hasNext = computed(() => currentIndex.value < props.steps.length - 1)

  const stepperClasses = computed(() => [
    'base-stepper',
    `base-stepper--${props.orientation}`,
    {
      'base-stepper--linear': props.linear,
    },
  ])

  const getStepClass = (step: Step) => [
    'base-stepper__step',
    `base-stepper__step--${step.status || 'pending'}`,
    {
      'base-stepper__step--disabled': step.disabled,
      'base-stepper__step--clickable': !props.linear && !step.disabled,
    },
  ]

  const goToStep = async (stepId: string) => {
    const stepIndex = props.steps.findIndex(step => step.id === stepId)
    const step = props.steps[stepIndex]

    if (!step || step.disabled) return

    // Validate linear progression
    if (props.linear && stepIndex > currentIndex.value) {
      for (let i = currentIndex.value; i < stepIndex; i++) {
        if (props.steps[i].status !== 'completed') {
          return
        }
      }
    }

    const previousStepId = currentStepId.value
    currentStepId.value = stepId
    emit('update:modelValue', stepId)
    emit('change', stepId, previousStepId)
  }

  const goToPrev = () => {
    if (hasPrev.value) {
      const prevStep = props.steps[currentIndex.value - 1]
      goToStep(prevStep.id)
    }
  }

  const goToNext = async () => {
    if (!hasNext.value) return

    const currentStep = props.steps[currentIndex.value]

    // Validate current step if needed
    if (currentStep.validate) {
      nextLoading.value = true
      try {
        const isValid = await currentStep.validate()
        if (!isValid) return
      } finally {
        nextLoading.value = false
      }
    }

    // Mark current step as completed
    if (props.linear) {
      currentStep.status = 'completed'
    }

    const nextStep = props.steps[currentIndex.value + 1]
    goToStep(nextStep.id)
  }

  const handleComplete = async () => {
    const currentStep = props.steps[currentIndex.value]

    // Validate current step if needed
    if (currentStep.validate) {
      completeLoading.value = true
      try {
        const isValid = await currentStep.validate()
        if (!isValid) return
      } finally {
        completeLoading.value = false
      }
    }

    emit('complete')
  }

  // Update steps status based on current step
  watch(() => currentIndex.value, (newIndex: number) => {
    props.steps.forEach((step, index) => {
      if (index < newIndex) {
        step.status = 'completed'
      } else if (index === newIndex) {
        step.status = 'current'
      } else {
        step.status = 'pending'
      }
    })
  }, { immediate: true })
</script>

<style scoped>
  .base-stepper {
    display: flex;
    flex-direction: column;
    gap: var(--space-xl);
  }

  .base-stepper--horizontal {
    flex-direction: column;
  }

  .base-stepper--vertical {
    flex-direction: row;
  }

  /* Steps */
  .base-stepper__steps {
    display: flex;
    position: relative;
  }

  .base-stepper--horizontal .base-stepper__steps {
    flex-direction: row;
    justify-content: space-between;
  }

  .base-stepper--vertical .base-stepper__steps {
    flex-direction: column;
    flex-shrink: 0;
    width: 300px;
    margin-right: var(--space-xl);
  }

  /* Step */
  .base-stepper__step {
    display: flex;
    flex: 1;
    position: relative;
  }

  .base-stepper--horizontal .base-stepper__step {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .base-stepper--vertical .base-stepper__step {
    flex-direction: row;
    align-items: flex-start;
    text-align: left;
    min-height: 80px;
  }

  .base-stepper__step--clickable {
    cursor: pointer;
  }

    .base-stepper__step--clickable:hover .base-stepper__title {
      color: var(--color-primary);
    }

  .base-stepper__step--disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* Connector */
  .base-stepper__connector {
    position: absolute;
    background: var(--color-border);
  }

  .base-stepper--horizontal .base-stepper__connector {
    top: 16px;
    left: -50%;
    right: 50%;
    height: 2px;
  }

  .base-stepper--vertical .base-stepper__connector {
    top: -50%;
    bottom: 50%;
    left: 16px;
    width: 2px;
  }

  .base-stepper__step--completed .base-stepper__connector {
    background: var(--color-primary);
  }

  /* Step content */
  .base-stepper__step-content {
    display: flex;
    align-items: flex-start;
    gap: var(--space-md);
    z-index: 1;
  }

  .base-stepper--horizontal .base-stepper__step-content {
    flex-direction: column;
    align-items: center;
  }

  .base-stepper--vertical .base-stepper__step-content {
    flex-direction: row;
    align-items: flex-start;
  }

  /* Indicator */
  .base-stepper__indicator {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: var(--radius-full);
    border: 2px solid var(--color-border);
    background: var(--color-surface);
    font-weight: var(--font-weight-semibold);
    font-size: 0.875rem;
    flex-shrink: 0;
    transition: all var(--transition-normal);
  }

  .base-stepper__step--completed .base-stepper__indicator {
    background: var(--color-primary);
    border-color: var(--color-primary);
    color: white;
  }

  .base-stepper__step--current .base-stepper__indicator {
    border-color: var(--color-primary);
    color: var(--color-primary);
  }

  .base-stepper__step--error .base-stepper__indicator {
    border-color: var(--color-error);
    color: var(--color-error);
  }

  .base-stepper__indicator-completed,
  .base-stepper__indicator-current,
  .base-stepper__indicator-pending {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* Label */
  .base-stepper__label {
    flex: 1;
    min-width: 0;
  }

  .base-stepper--horizontal .base-stepper__label {
    margin-top: var(--space-sm);
  }

  .base-stepper__title {
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-primary);
    line-height: 1.4;
    transition: color var(--transition-fast);
  }

  .base-stepper__step--completed .base-stepper__title,
  .base-stepper__step--current .base-stepper__title {
    color: var(--color-primary);
  }

  .base-stepper__step--error .base-stepper__title {
    color: var(--color-error);
  }

  .base-stepper__description {
    font-size: 0.875rem;
    color: var(--color-text-muted);
    line-height: 1.4;
    margin-top: var(--space-xs);
  }

  /* Content */
  .base-stepper__content {
    flex: 1;
    min-height: 200px;
  }

  .base-stepper__component {
    height: 100%;
  }

  /* Navigation */
  .base-stepper__navigation {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: var(--space-lg);
    border-top: 1px solid var(--color-border);
  }

  .base-stepper__navigation-right {
    display: flex;
    gap: var(--space-md);
  }

  /* Responsive */
  @media (max-width: 768px) {
    .base-stepper--vertical {
      flex-direction: column;
    }

      .base-stepper--vertical .base-stepper__steps {
        width: 100%;
        margin-right: 0;
        margin-bottom: var(--space-xl);
      }

    .base-stepper__navigation {
      flex-direction: column;
      gap: var(--space-md);
    }

    .base-stepper__navigation-right {
      width: 100%;
      justify-content: space-between;
    }
  }

  @media (max-width: 480px) {
    .base-stepper--horizontal .base-stepper__step-content {
      gap: var(--space-sm);
    }

    .base-stepper__title {
      font-size: 0.875rem;
    }

    .base-stepper__description {
      font-size: 0.8125rem;
    }
  }
</style>
