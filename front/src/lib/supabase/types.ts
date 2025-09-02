// データベース型定義（DB設計書に基づく）
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          role: Database['public']['Enums']['role']
          display_name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          role?: Database['public']['Enums']['role']
          display_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          role?: Database['public']['Enums']['role']
          display_name?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_details: {
        Row: {
          id: string
          user_id: string
          full_name: string | null
          email: string | null
          bank_name: string | null
          branch_name: string | null
          account_type: Database['public']['Enums']['account_type_enum'] | null
          account_number: string | null
          account_holder: string | null
          gender: Database['public']['Enums']['gender_enum'] | null
          birth_date: string | null
          prefecture: Database['public']['Enums']['prefecture_enum'] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          full_name?: string | null
          email?: string | null
          bank_name?: string | null
          branch_name?: string | null
          account_type?: Database['public']['Enums']['account_type_enum'] | null
          account_number?: string | null
          account_holder?: string | null
          gender?: Database['public']['Enums']['gender_enum'] | null
          birth_date?: string | null
          prefecture?: Database['public']['Enums']['prefecture_enum'] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          full_name?: string | null
          email?: string | null
          bank_name?: string | null
          branch_name?: string | null
          account_type?: Database['public']['Enums']['account_type_enum'] | null
          account_number?: string | null
          account_holder?: string | null
          gender?: Database['public']['Enums']['gender_enum'] | null
          birth_date?: string | null
          prefecture?: Database['public']['Enums']['prefecture_enum'] | null
          created_at?: string
          updated_at?: string
        }
      }
      cmt_counters: {
        Row: {
          seq_date: string
          last_no: number
          updated_at: string
        }
        Insert: {
          seq_date: string
          last_no?: number
          updated_at?: string
        }
        Update: {
          seq_date?: string
          last_no?: number
          updated_at?: string
        }
      }
      ideas: {
        Row: {
          id: string
          author_id: string
          mmb_no: string
          title: string
          summary: string
          detail: string | null
          attachments: string[]
          deadline: string | null
          status: 'published' | 'overdue' | 'closed'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          author_id: string
          mmb_no?: string
          title: string
          summary: string
          detail?: string | null
          attachments?: string[]
          deadline?: string | null
          status?: 'draft' | 'published' | 'closed' | 'overdue'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          author_id?: string
          mmb_no?: string
          title?: string
          summary?: string
          detail?: string | null
          attachments?: string[]
          deadline?: string | null
          status?: 'published' | 'closed' | 'overdue'
          created_at?: string
          updated_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          idea_id: string
          author_id: string
          text: string
          attachments: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          idea_id: string
          author_id: string
          text: string
          attachments?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          idea_id?: string
          author_id?: string
          text?: string
          attachments?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      idea_versions: {
        Row: {
          id: string
          idea_id: string
          type: Database['public']['Enums']['version_type']
          title: string
          summary: string
          body: string | null
          price: number | null
          is_public: boolean
          purchase_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          idea_id: string
          type: Database['public']['Enums']['version_type']
          title: string
          summary: string
          body?: string | null
          price?: number | null
          is_public?: boolean
          purchase_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          idea_id?: string
          type?: Database['public']['Enums']['version_type']
          title?: string
          summary?: string
          body?: string | null
          price?: number | null
          is_public?: boolean
          purchase_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      purchases: {
        Row: {
          id: string
          buyer_id: string
          idea_version_id: string
          amount: number
          invoice_url: string | null
          status: Database['public']['Enums']['purchase_status']
          paid_at: string
          created_at: string
        }
        Insert: {
          id?: string
          buyer_id: string
          idea_version_id: string
          amount: number
          invoice_url?: string | null
          status?: Database['public']['Enums']['purchase_status']
          paid_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          buyer_id?: string
          idea_version_id?: string
          amount?: number
          invoice_url?: string | null
          status?: Database['public']['Enums']['purchase_status']
          paid_at?: string
          created_at?: string
        }
      }
      // 広告関連テーブル（型定義はUIのために保持、実際の処理は無効）
      ads: {
        Row: {
          id: string
          title: string
          image_url: string
          link_url: string
          target_keywords: string[]
          active_from: string
          active_to: string
          priority: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          image_url: string
          link_url: string
          target_keywords: string[]
          active_from: string
          active_to: string
          priority?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          image_url?: string
          link_url?: string
          target_keywords?: string[]
          active_from?: string
          active_to?: string
          priority?: number
          created_at?: string
          updated_at?: string
        }
      }
      ad_metrics: {
        Row: {
          id: number
          ad_id: string
          user_id: string | null
          event: 'impression' | 'click'
          ip: string | null
          ua: string | null
          ts: string
        }
        Insert: {
          id?: number
          ad_id: string
          user_id?: string | null
          event: 'impression' | 'click'
          ip?: string | null
          ua?: string | null
          ts?: string
        }
        Update: {
          id?: number
          ad_id?: string
          user_id?: string | null
          event?: 'impression' | 'click'
          ip?: string | null
          ua?: string | null
          ts?: string
        }
      }
      pages: {
        Row: {
          slug: string
          content: any // JSONB
          draft: boolean
          updated_by: string | null
          updated_at: string
        }
        Insert: {
          slug: string
          content: any
          draft?: boolean
          updated_by?: string | null
          updated_at?: string
        }
        Update: {
          slug?: string
          content?: any
          draft?: boolean
          updated_by?: string | null
          updated_at?: string
        }
      }
      audit_logs: {
        Row: {
          id: number
          actor_id: string | null
          action: string
          entity: string
          entity_id: string | null
          payload: any // JSONB
          created_at: string
        }
        Insert: {
          id?: number
          actor_id?: string | null
          action: string
          entity: string
          entity_id?: string | null
          payload?: any
          created_at?: string
        }
        Update: {
          id?: number
          actor_id?: string | null
          action?: string
          entity?: string
          entity_id?: string | null
          payload?: any
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      search_ideas_by_keyword: {
        Args: {
          keyword_text: string
          limit_count?: number
          offset_count?: number
        }
        Returns: {
          id: string
          author_id: string
          mmb_no: string
          title: string
          summary: string
          tags: string[]
          status: string
          created_at: string
          updated_at: string
          similarity_score: number
        }[]
      }
      search_idea_by_mmb_no: {
        Args: {
          cmt_number: string
        }
        Returns: {
          id: string
          author_id: string
          mmb_no: string
          title: string
          summary: string
          tags: string[]
          status: string
          created_at: string
          updated_at: string
        }[]
      }
      search_idea_versions_by_keyword: {
        Args: {
          keyword_text: string
          limit_count?: number
          offset_count?: number
        }
        Returns: {
          id: string
          idea_id: string
          type: Database['public']['Enums']['version_type']
          title: string
          summary: string
          price: number | null
          purchase_count: number
          created_at: string
          similarity_score: number
        }[]
      }
      get_popular_ideas: {
        Args: {
          limit_count?: number
          offset_count?: number
        }
        Returns: {
          id: string
          author_id: string
          mmb_no: string
          title: string
          summary: string
          tags: string[]
          status: string
          created_at: string
          total_purchases: number
        }[]
      }
      generate_mmb_no: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      write_audit: {
        Args: {
          _actor: string | null
          _action: string
          _entity: string
          _entity_id: string | null
          _payload: any
        }
        Returns: undefined
      }
    }
    Enums: {
      role: 'member' | 'admin'
      version_type: 'X' | 'Y'
      purchase_status: 'succeeded' | 'refunded' | 'failed'
      account_type_enum: 'ordinary' | 'current'
      gender_enum: 'male' | 'female' | 'other'
      prefecture_enum: 'hokkaido' | 'aomori' | 'iwate' | 'miyagi' | 'akita' | 'yamagata' | 'fukushima' | 'ibaraki' | 'tochigi' | 'gunma' | 'saitama' | 'chiba' | 'tokyo' | 'kanagawa' | 'niigata' | 'toyama' | 'ishikawa' | 'fukui' | 'yamanashi' | 'nagano' | 'gifu' | 'shizuoka' | 'aichi' | 'mie' | 'shiga' | 'kyoto' | 'osaka' | 'hyogo' | 'nara' | 'wakayama' | 'tottori' | 'shimane' | 'okayama' | 'hiroshima' | 'yamaguchi' | 'tokushima' | 'kagawa' | 'ehime' | 'kochi' | 'fukuoka' | 'saga' | 'nagasaki' | 'kumamoto' | 'oita' | 'miyazaki' | 'kagoshima' | 'okinawa'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
