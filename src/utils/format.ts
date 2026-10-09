// تنسيق التاريخ بالعربية
export function formatDate(ts: number): string {
  try {
    return new Date(ts).toLocaleDateString('ar-SY', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return '';
  }
}

export function formatDateTime(ts: number): string {
  try {
    return new Date(ts).toLocaleString('ar-SY', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
}
