// 16進数カラーコードを受け取り、最適な文字色（'#FFFFFF'か'#000000'）を返す関数
export const getContrastingTextColor = (hexColor) => {
  if (!hexColor) return '#000000'; // 色が指定されていない場合は、黒を返す

  // #を取り除く (例: #FF5733 -> FF5733)
  const sanitizedHex = hexColor.replace('#', '');

  // RGB値に変換する
  const r = parseInt(sanitizedHex.substring(0, 2), 16);
  const g = parseInt(sanitizedHex.substring(2, 4), 16);
  const b = parseInt(sanitizedHex.substring(4, 6), 16);

  // W3C（ウェブ標準化団体）推奨の、輝度（明るさ）計算式
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // 輝度が0.5以上（明るい）なら黒文字、未満（暗い）なら白文字を返す
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
};
