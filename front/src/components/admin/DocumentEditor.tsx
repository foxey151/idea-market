'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

// React Quillを動的インポート（SSRの問題を回避）
const ReactQuill = dynamic(() => import('react-quill-new'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-96">
      エディタを読み込み中...
    </div>
  ),
});

// React Quillのスタイルをインポート
import 'react-quill/dist/quill.snow.css';

// React Quillのモジュール設定
const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ indent: '-1' }, { indent: '+1' }],
    ['link'],
    [{ color: [] }, { background: [] }],
    [{ align: [] }],
    ['clean'],
  ],
};

const quillFormats = [
  'header',
  'bold',
  'italic',
  'underline',
  'strike',
  'list',
  'indent',
  'link',
  'color',
  'background',
  'align',
];

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

// const documentPaths = {
//   terms: '/terms',
//   privacy: '/privacy',
//   commerce: '/commerce',
//   company: '/company',
// };

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

      // データベースからコンテンツを取得
      const response = await fetch(`/api/admin/documents?type=${type}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      const { data, error } = result;

      if (error && error.code !== 'PGRST116') {
        throw new Error('文書の取得に失敗しました');
      }

      // コンテンツが空の場合はデフォルトテキストを設定
      const finalContent = data?.content || getDefaultContent(type);

      setContent(finalContent);
      setOriginalContent(finalContent);
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
        return `default content`;

      case 'privacy':
        return `default content`;

      case 'commerce':
        return `default content`;

      case 'company':
        return `default content`;

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
      <DialogContent className="max-w-6xl h-[70vh] flex flex-col z-[100]">
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
            <div className="flex-1">
              <ReactQuill
                value={content}
                onChange={setContent}
                modules={quillModules}
                formats={quillFormats}
                placeholder="文書の内容を入力してください..."
                className="h-[400px]"
                theme="snow"
              />
            </div>
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
