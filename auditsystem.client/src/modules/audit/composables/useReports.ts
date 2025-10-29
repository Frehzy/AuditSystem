// src/modules/audit/composables/useReports.ts
import { ref, computed } from 'vue';
import { auditApiService } from '../api/auditApi.service';
import type { Report } from '../api/audit.types';

export const useReports = () => {
  const reports = ref<Report[]>([]);
  const selectedReport = ref<Report | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const recentReports = computed(() => {
    return reports.value
      .sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime())
      .slice(0, 10);
  });

  const pdfReports = computed(() => {
    return reports.value.filter(report => report.format === 'pdf');
  });

  const htmlReports = computed(() => {
    return reports.value.filter(report => report.format === 'html');
  });

  const jsonReports = computed(() => {
    return reports.value.filter(report => report.format === 'json');
  });

  const loadReports = async (): Promise<void> => {
    isLoading.value = true;
    error.value = null;

    try {
      reports.value = await auditApiService.getReports();
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Failed to load reports';
      console.error('Error loading reports:', err);
    } finally {
      isLoading.value = false;
    }
  };

  const generateReport = async (taskId: string, format: string): Promise<Report> => {
    isLoading.value = true;
    error.value = null;

    try {
      const report = await auditApiService.generateReport(taskId, format);
      reports.value.push(report);
      return report;
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Failed to generate report';
      console.error('Error generating report:', err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const downloadReport = async (reportId: string): Promise<void> => {
    try {
      const blob = await auditApiService.downloadReport(reportId);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-${reportId}.${blob.type.split('/')[1]}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Failed to download report';
      console.error('Error downloading report:', err);
      throw err;
    }
  };

  const selectReport = (report: Report | null): void => {
    selectedReport.value = report;
  };

  const deleteReport = async (reportId: string): Promise<void> => {
    isLoading.value = true;
    error.value = null;

    try {
      // Note: This endpoint might not exist yet, you'll need to implement it on the backend
      // await auditApiService.deleteReport(reportId);
      reports.value = reports.value.filter(report => report.id !== reportId);

      if (selectedReport.value?.id === reportId) {
        selectedReport.value = null;
      }
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Failed to delete report';
      console.error('Error deleting report:', err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const clearError = (): void => {
    error.value = null;
  };

  return {
    reports,
    selectedReport,
    isLoading,
    error,
    recentReports,
    pdfReports,
    htmlReports,
    jsonReports,
    loadReports,
    generateReport,
    downloadReport,
    selectReport,
    deleteReport,
    clearError
  };
};
