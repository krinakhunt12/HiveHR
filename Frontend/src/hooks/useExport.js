import { useCallback } from 'react';
import { exportToCSV, exportToExcel, exportToJSON } from '../utils/exportUtils';

export const useExport = () => {
  const [loading, setLoading] = useState(false);

  const exportData = useCallback(async (data, columns, filename, format = 'csv') => {
    setLoading(true);
    try {
      switch (format) {
        case 'csv':
          await exportToCSV(data, columns, filename);
          break;
        case 'excel':
          await exportToExcel(data, columns, filename);
          break;
        case 'json':
          await exportToJSON(data, filename);
          break;
        default:
          throw new Error(`Unsupported format: ${format}`);
      }
    } catch (error) {
      console.error('Export failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    exportData,
    loading
  };
};