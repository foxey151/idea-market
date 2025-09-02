'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Download, FileText } from 'lucide-react'
import { getLogs, LogType } from '@/lib/supabase/logs'
import { convertLogsToCSV, generateLogFileName } from '@/lib/utils/logExport'
import { useToast } from '@/hooks/use-toast'

interface LogDownloadModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function LogDownloadModal({ open, onOpenChange }: LogDownloadModalProps) {
  const [logType, setLogType] = useState<LogType>('audit')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [isDownloading, setIsDownloading] = useState(false)
  const { toast } = useToast()

  const handleDownload = async () => {
    try {
      setIsDownloading(true)

      // ログデータを取得
      const { data: logs, error } = await getLogs(logType, startDate, endDate, 10000)

      if (error) {
        toast({
          title: "エラー",
          description: "ログデータの取得に失敗しました",
          variant: "destructive",
        })
        return
      }

      if (!logs || logs.length === 0) {
        toast({
          title: "警告",
          description: "指定された条件に一致するログがありません",
          variant: "destructive",
        })
        return
      }

      // CSVに変換
      const csvContent = convertLogsToCSV(logs, logType)
      
      // ファイル名を生成
      const fileName = generateLogFileName(logType, startDate, endDate)
      
      // ダウンロード
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', fileName)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: "成功",
        description: `${logs.length}件のログをダウンロードしました`,
      })

      // モーダルを閉じる
      onOpenChange(false)

    } catch (error) {
      console.error('ログダウンロードエラー:', error)
      toast({
        title: "エラー",
        description: "ログのダウンロードに失敗しました",
        variant: "destructive",
      })
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            ログダウンロード設定
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
                  <div className="space-y-4">
          <div>
            <Label htmlFor="logType">ログの種類</Label>
            <Select value={logType} onValueChange={(value: any) => setLogType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="audit">監査ログ</SelectItem>
                <SelectItem value="access" disabled>アクセスログ（準備中）</SelectItem>
                <SelectItem value="error" disabled>エラーログ（準備中）</SelectItem>
                <SelectItem value="system" disabled>システムログ（準備中）</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate">開始日</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="endDate">終了日</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        </div>

          <div className="flex gap-3 pt-4">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              キャンセル
            </Button>
            <Button 
              onClick={handleDownload}
              disabled={isDownloading}
              className="flex-1"
            >
              {isDownloading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ダウンロード中...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  ログをダウンロード
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
