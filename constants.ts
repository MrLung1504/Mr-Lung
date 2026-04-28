export const COMPETENCIES = [
  { code: 'NLa', text: 'Sử dụng và quản lí các phương tiện ICT' },
  { code: 'NLb', text: 'Ứng xử phù hợp trong môi trường số' },
  { code: 'NLc', text: 'Giải quyết vấn đề với sự hỗ trợ của máy tính' },
  { code: 'NLd', text: 'Ứng dụng ICT trong học và tự học' },
  { code: 'NLe', text: 'Hợp tác trong môi trường số' },
];

export const COGNITIVE_LEVELS = [
  { key: 'biet', code: 'Biết', text: 'Nhận ra, liệt kê, kể ra.', color: 'blue' },
  { key: 'hieu', code: 'Hiểu', text: 'Giải thích, phân biệt, so sánh.', color: 'green' },
  { key: 'vanDung', code: 'Vận dụng', text: 'Thực hiện, sử dụng, thiết kế, xây dựng.', color: 'purple' },
];

export const LEVEL_COLORS: { [key: string]: { bg: string; text: string; border: string; } } = {
  blue: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-400' },
  green: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-400' },
  purple: { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-400' },
};
