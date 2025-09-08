'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface DocumentEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentType: 'terms' | 'privacy' | 'commerce' | 'company' | null;
}

const documentTitles = {
  terms: '利用規約',
  privacy: 'プライバシーポリシー',
  commerce: '特定商取引法に基づく表記',
  company: '会社情報',
};

const documentPaths = {
  terms: '/terms',
  privacy: '/privacy',
  commerce: '/commerce',
  company: '/company',
};

export function DocumentEditor({
  open,
  onOpenChange,
  documentType,
}: DocumentEditorProps) {
  const [content, setContent] = useState('');
  const [originalContent, setOriginalContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  // 文書の内容を取得する関数
  const fetchDocumentContent = async (type: string) => {
    try {
      setLoading(true);

      // 対応するページのHTMLを取得
      const response = await fetch(
        documentPaths[type as keyof typeof documentPaths]
      );
      if (!response.ok) {
        throw new Error('文書の取得に失敗しました');
      }

      const html = await response.text();

      // HTMLから実際のコンテンツ部分を抽出（簡易的な実装）
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      // セクション要素を取得してテキストに変換
      const sections = doc.querySelectorAll('section');
      let extractedContent = '';

      sections.forEach((section, _index) => {
        const heading = section.querySelector('h2');
        const content = section.querySelector('p, div');

        if (heading && content) {
          extractedContent += `${heading.textContent}\n\n${content.textContent}\n\n`;
        }
      });

      // コンテンツが空の場合はデフォルトテキストを設定
      if (!extractedContent.trim()) {
        extractedContent = getDefaultContent(type);
      }

      setContent(extractedContent);
      setOriginalContent(extractedContent);
    } catch (error) {
      console.error('文書取得エラー:', error);
      toast({
        title: 'エラー',
        description:
          '文書の取得に失敗しました。デフォルトコンテンツを表示します。',
        variant: 'destructive',
      });

      // エラー時はデフォルトコンテンツを設定
      const defaultContent = getDefaultContent(type);
      setContent(defaultContent);
      setOriginalContent(defaultContent);
    } finally {
      setLoading(false);
    }
  };

  // デフォルトコンテンツを取得
  const getDefaultContent = (type: string) => {
    switch (type) {
      case 'terms':
        return `第1条（適用範囲）

あああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああ。

第2条（サービスの内容）

いいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいい。

第3条（利用登録）

ううううううううううううううううううううううううううううううううううううううううううううううううううううううううううううううううううううううううううううううううううううううううううううううううううううううううううううううううううううううううう。`;

      case 'privacy':
        return `第1条（適用範囲）

あああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああ。

第2条（個人情報の収集）

いいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいいい。

第3条（個人情報の利用目的）

ううううううううううううううううううううううううううううううううううううううううううううううううううううううううううううううううううううううううううううううううううううううううううううううううううううううううううううううううううううううううう。`;

      case 'commerce':
        return `販売業者

さささささささささささささささささささささささささささささささささささささささささささささささささささささささささささささささささささささささささささささささささささささささささささささささささささささささささささささささささささささささささ。

運営統括責任者

しししししししししししししししししししししししししししししししししししししししししししししししししししししししししししししししししししししししししししししししししししししししししししししししししししししししししししししししししししししししし。

所在地

すすすすすすすすすすすすすすすすすすすすすすすすすすすすすすすすすすすすすすすすすすすすすすすすすすすすすすすすすすすすすすすすすすすすすすすすすすすすすすすすすすすすすすすすすすすすすすすすすすすすすすすすすすすすすすすすすすす。`;

      case 'company':
        return `会社概要

会社名: にににににににににににににににににににににににににににににににににににににににににににににににににににににににににににに

代表取締役: ぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬぬ

設立年月日: ねねねねねねねねねねねねねねねねねねねねねねねねねねねねねねねねねねねねねねねねねねねねねねねねねねねねねねねねねねね

資本金: ののののののののののののののののののののののののののののののののののののののののののののののののののののののののののの

従業員数: はははははははははははははははははははははははははははははははははははははははははははははははははははははははははははは`;

      default:
        return '';
    }
  };

  // 文書タイプが変更されたときにコンテンツを取得
  useEffect(() => {
    if (open && documentType) {
      fetchDocumentContent(documentType);
    }
  }, [open, documentType]); // eslint-disable-line react-hooks/exhaustive-deps

  // 保存処理
  const handleSave = async () => {
    if (!documentType) return;

    try {
      setSaving(true);

      // API呼び出しで文書を更新する
      const response = await fetch('/api/admin/documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentType,
          content,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '保存に失敗しました');
      }

      const result = await response.json();
      setOriginalContent(content);

      toast({
        title: '保存完了',
        description:
          result.message || `${documentTitles[documentType]}を保存しました。`,
      });

      onOpenChange(false);
    } catch (error) {
      console.error('保存エラー:', error);
      toast({
        title: '保存エラー',
        description:
          error instanceof Error ? error.message : '文書の保存に失敗しました。',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  // キャンセル処理
  const handleCancel = () => {
    if (content !== originalContent) {
      // 簡素化：直接閉じる（必要に応じて確認ダイアログを後で追加）
      setContent(originalContent);
      onOpenChange(false);
    } else {
      onOpenChange(false);
    }
  };

  if (!documentType) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {documentTitles[documentType]}の編集
          </DialogTitle>
          <DialogDescription>
            文書の内容を編集してください。編集完了後は保存ボタンをクリックしてください。
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 min-h-0 flex flex-col space-y-4">
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">文書を読み込み中...</p>
              </div>
            </div>
          ) : (
            <Textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="文書の内容を入力してください..."
              className="flex-1 min-h-[400px] resize-none font-mono text-sm"
            />
          )}
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button variant="outline" onClick={handleCancel} disabled={saving}>
            キャンセル
          </Button>
          <Button onClick={handleSave} disabled={saving || loading}>
            {saving ? '保存中...' : '保存'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
