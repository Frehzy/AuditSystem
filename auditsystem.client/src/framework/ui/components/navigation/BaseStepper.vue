<!-- src/framework/ui/components/navigation/BaseStepper.vue -->
<template>
  <div class="base-stepper" :class="stepperClasses">
    <!-- Progress Steps Header -->
    <div class="base-stepper__header">
      <div class="base-stepper__progress">
        <div class="progress-steps">
          <div v-for="(step, index) in steps"
               :key="step.id"
               class="progress-step"
               :class="{
                 'progress-step--completed': step.status === 'completed',
                 'progress-step--current': step.status === 'current',
                 'progress-step--error': step.status === 'error',
                 'progress-step--disabled': step.disabled,
                 'progress-step--clickable': !linear && !step.disabled
               }"
               @click="!linear && !step.disabled ? goToStep(step.id) : null">

            <!-- Step connector -->
            <div v-if="index > 0" class="progress-step__connector" />

            <div class="step-indicator">
              <!-- Completed step -->
              <span v-if="step.status === 'completed'" class="step-check">
                <CheckIcon size="16" />
              </span>

              <!-- Error step -->
              <span v-else-if="step.status === 'error'" class="step-error">
                <AlertCircleIcon size="16" />
              </span>

              <!-- Current or pending step -->
              <span v-else class="step-number">
                {{ index + 1 }}
              </span>
            </div>

            <span class="step-label">
              {{ step.title }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Step content -->
    <div class="base-stepper__content">
      <div class="step-content__header">
        <h3 class="step-title">{{ currentStep?.title }}</h3>
        <p v-if="currentStep?.description" class="step-description">
          {{ currentStep.description }}
        </p>
      </div>

      <div class="step-content__body">
        <slot :name="currentStep?.id" :step="currentStep" :index="currentIndex">
          <div v-if="currentStep?.component" class="step-component">
            <component :is="currentStep.component" v-bind="currentStep.props" />
          </div>
        </slot>
      </div>
    </div>

    <!-- Navigation -->
    <div v-if="showNavigation" class="base-stepper__navigation">
      <div class="navigation-left">
        <BaseButton v-if="currentIndex > 0"
                    @click="goToPrev"
                    variant="secondary"
                    size="lg"
                    class="nav-btn">
          <ArrowLeftIcon class="button-icon" />
          Назад
        </BaseButton>
      </div>

      <div class="navigation-center">
        <span class="step-info">Шаг {{ currentIndex + 1 }} из {{ steps.length }}</span>
      </div>

      <div class="navigation-right">
        <BaseButton v-if="hasNext"
                    @click="goToNext"
                    :loading="nextLoading"
                    variant="primary"
                    size="lg"
                    class="nav-btn">
          Продолжить
          <ArrowRightIcon class="button-icon" />
        </BaseButton>

        <BaseButton v-else
                    @click="handleComplete"
                    :loading="completeLoading"
                    variant="primary"
                    size="lg"
                    class="nav-btn complete-btn">
          <CheckIcon class="button-icon" />
          {{ completeText }}
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref, watch } from 'vue'
  import { CheckIcon, ArrowLeftIcon, ArrowRightIcon, AlertCircleIcon } from '@/assets/icons'
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
    background: var(--color-surface);
    border-radius: var(--radius-xl);
    border: 1px solid var(--color-border);
    overflow: hidden;
  }

  /* Header with Progress Steps */
  .base-stepper__header {
    background: var(--color-surface-hover);
    border-bottom: 1px solid var(--color-border);
    padding: var(--space-xl);
  }

  .base-stepper__progress {
    width: 100%;
  }

  .progress-steps {
    display: flex;
    justify-content: space-between;
    position: relative;
  }

    .progress-steps::before {
      content: '';
      position: absolute;
      top: 1rem;
      left: 2rem;
      right: 2rem;
      height: 2px;
      background: var(--color-border);
      z-index: 1;
    }

  .progress-step {
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    z-index: 2;
    transition: all var(--transition-fast);
  }

  .progress-step--clickable {
    cursor: pointer;
  }

    .progress-step--clickable:hover .step-label {
      color: var(--color-primary);
    }

  .progress-step--disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .progress-step__connector {
    position: absolute;
    top: 1rem;
    left: -50%;
    right: 50%;
    height: 2px;
    background: var(--color-border);
    z-index: 1;
  }

  .progress-step--completed .progress-step__connector {
    background: var(--color-success);
  }

  .step-indicator {
    width: 2rem;
    height: 2rem;
    border-radius: var(--radius-full);
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--color-surface);
    border: 2px solid var(--color-border);
    transition: all var(--transition-fast);
    margin-bottom: var(--space-sm);
    position: relative;
    z-index: 2;
  }

  .progress-step--current .step-indicator {
    border-color: var(--color-primary);
    background: var(--color-primary);
    color: white;
    transform: scale(1.1);
  }

  .progress-step--completed .step-indicator {
    border-color: var(--color-success);
    background: var(--color-success);
    color: white;
  }

  .progress-step--error .step-indicator {
    border-color: var(--color-error);
    background: var(--color-error);
    color: white;
  }

  .step-check,
  .step-error,
  .step-number {
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: var(--font-weight-semibold);
    font-size: 0.875rem;
  }

  .step-label {
    font-size: 0.875rem;
    font-weight: var(--font-weight-medium);
    color: var(--color-text-secondary);
    text-align: center;
    max-width: 120px;
    transition: color var(--transition-fast);
  }

  .progress-step--current .step-label {
    color: var(--color-primary);
    font-weight: var(--font-weight-semibold);
  }

  .progress-step--completed .step-label {
    color: var(--color-success);
  }

  .progress-step--error .step-label {
    color: var(--color-error);
  }

  /* Content Area */
  .base-stepper__content {
    flex: 1;
    padding: var(--space-2xl);
    display: flex;
    flex-direction: column;
    gap: var(--space-xl);
  }

  .step-content__header {
    text-align: center;
    margin-bottom: var(--space-lg);
  }

  .step-title {
    font-size: 1.5rem;
    font-weight: var(--font-weight-bold);
    color: var(--color-text-primary);
    margin: 0 0 var(--space-sm) 0;
  }

  .step-description {
    font-size: 1rem;
    color: var(--color-text-secondary);
    margin: 0;
    max-width: 500px;
    margin-left: auto;
    margin-right: auto;
  }

  .step-content__body {
    flex: 1;
    min-height: 200px;
  }

  .step-component {
    height: 100%;
  }

  /* Navigation */
  .base-stepper__navigation {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--space-xl);
    border-top: 1px solid var(--color-border);
    background: var(--color-surface-hover);
  }

  .navigation-left,
  .navigation-right {
    display: flex;
    gap: var(--space-md);
  }

  .navigation-center {
    display: flex;
    align-items: center;
  }

  .step-info {
    font-size: 0.875rem;
    color: var(--color-text-muted);
    font-weight: var(--font-weight-medium);
  }

  .nav-btn {
    min-width: 120px;
  }

  .complete-btn {
    min-width: 140px;
  }

  .button-icon {
    width: 1.125rem;
    height: 1.125rem;
  }

  /* Orientation Variants */
  .base-stepper--vertical {
    flex-direction: row;
    min-height: 500px;
  }

    .base-stepper--vertical .base-stepper__header {
      width: 300px;
      border-bottom: none;
      border-right: 1px solid var(--color-border);
      padding: var(--space-xl);
    }

    .base-stepper--vertical .base-stepper__content {
      flex: 1;
    }

    .base-stepper--vertical .progress-steps {
      flex-direction: column;
      height: 100%;
      justify-content: flex-start;
      gap: var(--space-xl);
    }

      .base-stepper--vertical .progress-steps::before {
        top: 2rem;
        bottom: 2rem;
        left: 1rem;
        right: auto;
        width: 2px;
        height: auto;
      }

    .base-stepper--vertical .progress-step {
      flex-direction: row;
      text-align: left;
      gap: var(--space-md);
    }

    .base-stepper--vertical .step-indicator {
      margin-bottom: 0;
    }

    .base-stepper--vertical .step-label {
      text-align: left;
      max-width: none;
    }

    .base-stepper--vertical .progress-step__connector {
      top: -50%;
      bottom: 50%;
      left: 1rem;
      right: auto;
      width: 2px;
      height: auto;
    }

  /* Responsive */
  @media (max-width: 768px) {
    .base-stepper--vertical {
      flex-direction: column;
      min-height: auto;
    }

      .base-stepper--vertical .base-stepper__header {
        width: 100%;
        border-right: none;
        border-bottom: 1px solid var(--color-border);
      }

      .base-stepper--vertical .progress-steps {
        flex-direction: row;
        overflow-x: auto;
        padding-bottom: var(--space-md);
      }

      .base-stepper--vertical .progress-step {
        flex-direction: column;
        text-align: center;
        min-width: 100px;
      }

    .base-stepper__content {
      padding: var(--space-xl);
    }

    .base-stepper__navigation {
      flex-direction: column;
      gap: var(--space-md);
    }

    .navigation-left,
    .navigation-center,
    .navigation-right {
      width: 100%;
      justify-content: space-between;
    }

    .navigation-center {
      order: -1;
      justify-content: center;
    }

    .nav-btn {
      min-width: auto;
      flex: 1;
    }
  }

  @media (max-width: 480px) {
    .base-stepper__header {
      padding: var(--space-lg);
    }

    .base-stepper__content {
      padding: var(--space-lg);
    }

    .step-title {
      font-size: 1.25rem;
    }

    .step-description {
      font-size: 0.9rem;
    }

    .progress-steps::before {
      left: 1.5rem;
      right: 1.5rem;
    }

    .step-label {
      font-size: 0.75rem;
      max-width: 80px;
    }
  }

  /* Animation */
  @keyframes slide-in {
    from {
      opacity: 0;
      transform: translateX(20px);
    }

    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  .step-content__body {
    animation: slide-in 0.3s ease-out;
  }
</style>
