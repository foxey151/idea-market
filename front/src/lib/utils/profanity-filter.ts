/**
 * 不適切な言葉のフィルター機能
 * 
 * 注意: このリストは一般的な不適切な言葉を含んでいます。
 * 実際の運用では、外部ファイルやデータベースから読み込むことを推奨します。
 */

// 不適切な言葉のリスト
// カテゴリー別に整理されていますが、実際の運用では管理画面から追加・削除できるようにすることを推奨します
const PROFANITY_WORDS = [
  // 差別的・侮蔑的な表現
  'バカ',
  'アホ',
  'カス',
  'クソ',
  '死ね',
  '殺す',
  '消えろ',
  'うざい',
  'キモい',
  'ブス',
  'デブ',
  'チビ',
  'ガキ',
  'キチガイ',
  '気違い',
  'キ印',
  'マヌケ',
  'アホ',
  'ボケ',
  'タコ',
  'ハゲ',
  'チンカス',
  'クソ野郎',
  'バカ野郎',
  'アホ野郎',
  'カス野郎',
  'クズ',
  'ゴミ',
  'クソガキ',
  '死ねばいい',
  '死ねよ',
  '死ね',
  '殺してやる',
  '殺してあげる',
  '殺したい',
  '消えろ',
  '消えて',
  'うざったい',
  'キモったい',
  'キショい',
  'キモ',
  'ブサイク',
  'デブ豚',
  'チビデブ',
  'ガキんちょ',
  'ガキ大将',
  'キチガイ',
  '気違い',
  'チンカス',
  'クソ野郎',
  'バカ野郎',
  'アホ野郎',
  'カス野郎',
  'クズ',
  'ゴミ',
  'クソガキ',
  '死ねばいい',
  '死ねよ',
  '殺してやる',
  '殺してあげる',
  '殺したい',
  '消えて',
  'うざったい',
  'キモったい',
  'キショい',
  'ブサイク',
  
  // 性的な表現（一般的な不適切な表現）
  'エッチ',
  'セックス',
  'SEX',
  'AV',
  'アダルト',
  'アダルトビデオ',
  'ポルノ',
  'PORNO',
  '風俗',
  'ソープ',
  'デリヘル',
  '出会い系',
  '援助交際',
  
  // 暴力的な表現
  '殺害',
  '爆破',
  'テロ',
  'テロリスト',
  '自殺',
  '自殺方法',
  '自殺サイト',
  '自殺願望',
  
  // スパム・詐欺関連（明確に不適切なもののみ）
  '審査なし',
  '即日融資',
  '即日借入',
  '即日審査',
  '即日キャッシング',
  '即日カードローン',
  '即日消費者金融',
  'サラ金',
  '闇金',
  'ヤミ金',
  '高利貸し',
  '高利貸',
  '違法融資',
  '違法借入',
  '違法キャッシング',
  '違法ローン',
  
  // 薬物・違法行為関連
  'ドラッグ',
  '麻薬',
  '覚醒剤',
  '大麻',
  'コカイン',
  'LSD',
  'MDMA',
  '違法',
  '脱法',
  '合法ドラッグ',
  
  // その他の不適切な表現
  '詐欺',
  '騙す',
  'だます',
  'ペテン',
  'インチキ',
  'ニセ',
  '偽物',
  'コピー商品',
  '海賊版',
  '違法ダウンロード',
  'アダルトサイト',
  'アダルト動画',
  'エロ',
  'エロ動画',
  'エロサイト',
  'アダルトコンテンツ',
  
  // 差別的な表現（侮蔑的な使用のみを対象）
  // 注意: 医学的・社会的に適切な用語（例: 障害者、うつ病など）は含めていません
  // これらは文脈によって適切に使用される場合があるため、個別に判断が必要です
  
  // 人種・民族差別的な表現（侮蔑的な使用）
  '在日特権',
  '不法滞在者',
  '不法就労者',
  
  // 性的指向・性自認に関する差別的な表現（侮蔑的な使用）
  'ホモ野郎',
  'レズ野郎',
  'ゲイ野郎',
  
  // 宗教に関する差別的な表現（侮蔑的な使用）
  '創価学会員',
  '統一教会員',
  'オウム信者',
  
  // その他の差別的な表現（歴史的差別用語）
  'エタ',
  '非人',
  '穢多',
  '新平民',
  '部落',
  '同和',
  '被差別部落',
  '特殊部落',
];

// 部分一致も検出するためのパターン（スペースや記号で区切られた場合など）
const PROFANITY_PATTERNS: RegExp[] = [
  // URLやメールアドレスを含むスパムパターン
  /https?:\/\/[^\s]+/gi,
  /www\.[^\s]+/gi,
  /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi,
  
  // 連続した数字（電話番号や口座番号の可能性）
  /\d{10,}/g,
  
  // 連続した同じ文字（スパムの可能性）
  /(.)\1{10,}/gi,
  
  // 不適切な言葉の変形パターン（例: バカ -> バ*カ、バーカなど）
  /バ[＊*・･]カ/gi,
  /ア[＊*・･]ホ/gi,
  /ク[＊*・･]ソ/gi,
  
  // 特定の不適切な組み合わせ
  /死[ねぬ]|消[えろ]|殺[すせ]|うざ[いっ]|キモ[いっ]/gi,
];

/**
 * テキストに不適切な言葉が含まれているかチェック
 * @param text チェックするテキスト
 * @returns 不適切な言葉が含まれている場合、最初に見つかった言葉を返す。含まれていない場合はnull
 */
export function containsProfanity(text: string): string | null {
  if (!text || typeof text !== 'string') {
    return null;
  }

  const normalizedText = text.toLowerCase().trim();

  // 完全一致チェック
  for (const word of PROFANITY_WORDS) {
    if (normalizedText.includes(word.toLowerCase())) {
      return word;
    }
  }

  // パターンマッチチェック
  for (const pattern of PROFANITY_PATTERNS) {
    if (pattern.test(normalizedText)) {
      return pattern.toString();
    }
  }

  return null;
}

/**
 * テキストに不適切な言葉が含まれているかチェック（boolean版）
 * @param text チェックするテキスト
 * @returns 不適切な言葉が含まれている場合true
 */
export function hasProfanity(text: string): boolean {
  return containsProfanity(text) !== null;
}

/**
 * テキストから不適切な言葉をマスクする
 * @param text マスクするテキスト
 * @param maskChar マスクに使用する文字（デフォルト: *）
 * @returns マスクされたテキスト
 */
export function maskProfanity(text: string, maskChar: string = '*'): string {
  if (!text || typeof text !== 'string') {
    return text;
  }

  let maskedText = text;

  // 完全一致のマスク
  for (const word of PROFANITY_WORDS) {
    const regex = new RegExp(word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    maskedText = maskedText.replace(regex, maskChar.repeat(word.length));
  }

  // パターンマッチのマスク
  for (const pattern of PROFANITY_PATTERNS) {
    maskedText = maskedText.replace(pattern, (match) => maskChar.repeat(match.length));
  }

  return maskedText;
}

/**
 * Zodスキーマ用のカスタムバリデーション
 * 不適切な言葉が含まれている場合、エラーメッセージを返す
 */
export function validateNoProfanity(text: string): { valid: boolean; error?: string } {
  const profanity = containsProfanity(text);
  
  if (profanity) {
    return {
      valid: false,
      error: `不適切な言葉が含まれています。内容を確認してください。`,
    };
  }

  return { valid: true };
}

