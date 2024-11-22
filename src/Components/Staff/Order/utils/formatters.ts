// utils/formatters.ts

export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };
  
  export const formatDate = (dateString: string): string => {
    try {
      return new Intl.DateTimeFormat('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(dateString));
    } catch (error) {
      console.error('Date formatting error:', error);
      return dateString;
    }
  };
  
  export const getOrderStatus = (process: number): {
    label: string;
    className: string;
  } => {
    switch (process) {
      case 1:
        return { label: 'Processing', className: 'status-processing' };
      case 2:
        return { label: 'Ready for Pickup', className: 'status-ready' };
      case 3:
        return { label: 'Completed', className: 'status-completed' };
      default:
        return { label: 'Unknown', className: 'status-unknown' };
    }
  };