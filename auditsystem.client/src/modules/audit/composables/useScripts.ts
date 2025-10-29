// src/modules/audit/composables/useScripts.ts
import { ref, computed } from 'vue';
import { auditApiService } from '../api/auditApi.service';
import type { Script, CreateScriptCommand } from '../api/audit.types';

export const useScripts = () => {
  const scripts = ref<Script[]>([]);
  const selectedScript = ref<Script | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const checkScripts = computed(() => {
    return scripts.value.filter(script => script.type === 'check');
  });

  const fixScripts = computed(() => {
    return scripts.value.filter(script => script.type === 'fix');
  });

  const securityScripts = computed(() => {
    return scripts.value.filter(script => script.category === 'security');
  });

  const complianceScripts = computed(() => {
    return scripts.value.filter(script => script.category === 'compliance');
  });

  const performanceScripts = computed(() => {
    return scripts.value.filter(script => script.category === 'performance');
  });

  const loadScripts = async (): Promise<void> => {
    isLoading.value = true;
    error.value = null;

    try {
      scripts.value = await auditApiService.getScripts();
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Failed to load scripts';
      console.error('Error loading scripts:', err);
    } finally {
      isLoading.value = false;
    }
  };

  const createScript = async (command: CreateScriptCommand): Promise<Script> => {
    isLoading.value = true;
    error.value = null;

    try {
      const script = await auditApiService.createScript(command);
      scripts.value.push(script);
      return script;
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Failed to create script';
      console.error('Error creating script:', err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const updateScript = async (id: string, command: Partial<CreateScriptCommand>): Promise<Script> => {
    isLoading.value = true;
    error.value = null;

    try {
      const script = await auditApiService.updateScript(id, command);
      const index = scripts.value.findIndex(s => s.id === id);
      if (index !== -1) {
        scripts.value[index] = { ...scripts.value[index], ...script };
      }

      if (selectedScript.value?.id === id) {
        selectedScript.value = script;
      }

      return script;
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Failed to update script';
      console.error('Error updating script:', err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const deleteScript = async (id: string): Promise<void> => {
    isLoading.value = true;
    error.value = null;

    try {
      await auditApiService.deleteScript(id);
      scripts.value = scripts.value.filter(script => script.id !== id);

      if (selectedScript.value?.id === id) {
        selectedScript.value = null;
      }
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Failed to delete script';
      console.error('Error deleting script:', err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const selectScript = (script: Script | null): void => {
    selectedScript.value = script;
  };

  const getScriptById = (id: string): Script | undefined => {
    return scripts.value.find(script => script.id === id);
  };

  const getFixScriptForCheck = (checkScriptId: string): Script | undefined => {
    return scripts.value.find(script =>
      script.type === 'fix' && script.checkScriptId === checkScriptId
    );
  };

  const clearError = (): void => {
    error.value = null;
  };

  return {
    scripts,
    selectedScript,
    isLoading,
    error,
    checkScripts,
    fixScripts,
    securityScripts,
    complianceScripts,
    performanceScripts,
    loadScripts,
    createScript,
    updateScript,
    deleteScript,
    selectScript,
    getScriptById,
    getFixScriptForCheck,
    clearError
  };
};
