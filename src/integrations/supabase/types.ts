export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      abandoned_carts: {
        Row: {
          cart_data: Json | null
          created_at: string | null
          customer_email: string | null
          customer_name: string | null
          event_type: string | null
          id: string
          package_name: string | null
          recovered: boolean | null
          recovered_at: string | null
          reminder_sent: boolean | null
          reminder_sent_at: string | null
          session_id: string
          total_price: number | null
          updated_at: string | null
        }
        Insert: {
          cart_data?: Json | null
          created_at?: string | null
          customer_email?: string | null
          customer_name?: string | null
          event_type?: string | null
          id?: string
          package_name?: string | null
          recovered?: boolean | null
          recovered_at?: string | null
          reminder_sent?: boolean | null
          reminder_sent_at?: string | null
          session_id: string
          total_price?: number | null
          updated_at?: string | null
        }
        Update: {
          cart_data?: Json | null
          created_at?: string | null
          customer_email?: string | null
          customer_name?: string | null
          event_type?: string | null
          id?: string
          package_name?: string | null
          recovered?: boolean | null
          recovered_at?: string | null
          reminder_sent?: boolean | null
          reminder_sent_at?: string | null
          session_id?: string
          total_price?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      ai_generated_content: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          content: string
          content_type: string
          created_at: string | null
          id: string
          metadata: Json | null
          prompt_used: string | null
          status: string
          title: string | null
          updated_at: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          content: string
          content_type: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          prompt_used?: string | null
          status?: string
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          content?: string
          content_type?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          prompt_used?: string | null
          status?: string
          title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      app_settings: {
        Row: {
          key: string
          updated_at: string | null
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string | null
          value: Json
        }
        Update: {
          key?: string
          updated_at?: string | null
          value?: Json
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author_name: string
          category: string
          content: string
          created_at: string
          excerpt: string
          featured: boolean
          focus_keyword: string | null
          id: string
          image_url: string
          meta_description: string | null
          published: boolean
          published_at: string | null
          read_time: string
          scheduled_publish_at: string | null
          slug: string
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          author_name?: string
          category: string
          content?: string
          created_at?: string
          excerpt: string
          featured?: boolean
          focus_keyword?: string | null
          id?: string
          image_url: string
          meta_description?: string | null
          published?: boolean
          published_at?: string | null
          read_time?: string
          scheduled_publish_at?: string | null
          slug: string
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          author_name?: string
          category?: string
          content?: string
          created_at?: string
          excerpt?: string
          featured?: boolean
          focus_keyword?: string | null
          id?: string
          image_url?: string
          meta_description?: string | null
          published?: boolean
          published_at?: string | null
          read_time?: string
          scheduled_publish_at?: string | null
          slug?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      chat_analytics: {
        Row: {
          count: number
          created_at: string
          id: string
          last_asked_at: string
          question_pattern: string | null
          topic: string
        }
        Insert: {
          count?: number
          created_at?: string
          id?: string
          last_asked_at?: string
          question_pattern?: string | null
          topic: string
        }
        Update: {
          count?: number
          created_at?: string
          id?: string
          last_asked_at?: string
          question_pattern?: string | null
          topic?: string
        }
        Relationships: []
      }
      chat_conversations: {
        Row: {
          ended_at: string | null
          id: string
          message_count: number
          page_url: string | null
          session_id: string
          started_at: string
          user_agent: string | null
        }
        Insert: {
          ended_at?: string | null
          id?: string
          message_count?: number
          page_url?: string | null
          session_id: string
          started_at?: string
          user_agent?: string | null
        }
        Update: {
          ended_at?: string | null
          id?: string
          message_count?: number
          page_url?: string | null
          session_id?: string
          started_at?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          response_time_ms: number | null
          role: string
          suggestions: string[] | null
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          response_time_ms?: number | null
          role: string
          suggestions?: string[] | null
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          response_time_ms?: number | null
          role?: string
          suggestions?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      chatbot_escalations: {
        Row: {
          assigned_to: string | null
          conversation_summary: string | null
          created_at: string | null
          customer_email: string | null
          customer_name: string | null
          customer_phone: string | null
          escalation_reason: string
          id: string
          priority: string
          resolution_notes: string | null
          resolved_at: string | null
          session_id: string
          status: string
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          conversation_summary?: string | null
          created_at?: string | null
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          escalation_reason: string
          id?: string
          priority?: string
          resolution_notes?: string | null
          resolved_at?: string | null
          session_id: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          conversation_summary?: string | null
          created_at?: string | null
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          escalation_reason?: string
          id?: string
          priority?: string
          resolution_notes?: string | null
          resolved_at?: string | null
          session_id?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      coupons: {
        Row: {
          code: string
          created_at: string | null
          description: string | null
          discount_type: string
          discount_value: number
          id: string
          is_active: boolean | null
          max_discount: number | null
          min_order_amount: number | null
          times_used: number | null
          usage_limit: number | null
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          description?: string | null
          discount_type: string
          discount_value: number
          id?: string
          is_active?: boolean | null
          max_discount?: number | null
          min_order_amount?: number | null
          times_used?: number | null
          usage_limit?: number | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          description?: string | null
          discount_type?: string
          discount_value?: number
          id?: string
          is_active?: boolean | null
          max_discount?: number | null
          min_order_amount?: number | null
          times_used?: number | null
          usage_limit?: number | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: []
      }
      customer_otps: {
        Row: {
          created_at: string | null
          email: string
          expires_at: string
          id: string
          otp_code: string
          verified: boolean | null
        }
        Insert: {
          created_at?: string | null
          email: string
          expires_at: string
          id?: string
          otp_code: string
          verified?: boolean | null
        }
        Update: {
          created_at?: string | null
          email?: string
          expires_at?: string
          id?: string
          otp_code?: string
          verified?: boolean | null
        }
        Relationships: []
      }
      data_exports: {
        Row: {
          completed_at: string | null
          created_at: string | null
          expires_at: string | null
          export_type: string
          file_size: number | null
          file_url: string | null
          filters: Json | null
          format: string
          id: string
          records_count: number | null
          requested_by: string | null
          status: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          expires_at?: string | null
          export_type: string
          file_size?: number | null
          file_url?: string | null
          filters?: Json | null
          format: string
          id?: string
          records_count?: number | null
          requested_by?: string | null
          status?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          expires_at?: string | null
          export_type?: string
          file_size?: number | null
          file_url?: string | null
          filters?: Json | null
          format?: string
          id?: string
          records_count?: number | null
          requested_by?: string | null
          status?: string
        }
        Relationships: []
      }
      expense_categories: {
        Row: {
          color: string | null
          created_at: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount: number
          category_id: string | null
          created_at: string | null
          created_by: string | null
          description: string
          expense_date: string
          id: string
          notes: string | null
          order_id: string | null
          payment_method: string | null
          receipt_url: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          category_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description: string
          expense_date?: string
          id?: string
          notes?: string | null
          order_id?: string | null
          payment_method?: string | null
          receipt_url?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          category_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string
          expense_date?: string
          id?: string
          notes?: string | null
          order_id?: string | null
          payment_method?: string | null
          receipt_url?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expenses_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "expense_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_reports: {
        Row: {
          created_at: string | null
          generated_at: string | null
          id: string
          net_profit: number | null
          orders_count: number | null
          period_end: string
          period_start: string
          report_data: Json | null
          report_type: string
          sent_to_email: string | null
          total_expenses: number | null
          total_revenue: number | null
        }
        Insert: {
          created_at?: string | null
          generated_at?: string | null
          id?: string
          net_profit?: number | null
          orders_count?: number | null
          period_end: string
          period_start: string
          report_data?: Json | null
          report_type: string
          sent_to_email?: string | null
          total_expenses?: number | null
          total_revenue?: number | null
        }
        Update: {
          created_at?: string | null
          generated_at?: string | null
          id?: string
          net_profit?: number | null
          orders_count?: number | null
          period_end?: string
          period_start?: string
          report_data?: Json | null
          report_type?: string
          sent_to_email?: string | null
          total_expenses?: number | null
          total_revenue?: number | null
        }
        Relationships: []
      }
      follow_up_logs: {
        Row: {
          error_message: string | null
          follow_up_type: string
          id: string
          order_id: string
          sent_at: string
          success: boolean
        }
        Insert: {
          error_message?: string | null
          follow_up_type: string
          id?: string
          order_id: string
          sent_at?: string
          success?: boolean
        }
        Update: {
          error_message?: string | null
          follow_up_type?: string
          id?: string
          order_id?: string
          sent_at?: string
          success?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "follow_up_logs_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      follow_up_settings: {
        Row: {
          created_at: string
          days_after: number
          email_subject: string
          email_template: string
          enabled: boolean
          follow_up_type: string
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          days_after?: number
          email_subject: string
          email_template: string
          enabled?: boolean
          follow_up_type: string
          id?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          days_after?: number
          email_subject?: string
          email_template?: string
          enabled?: boolean
          follow_up_type?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      invoice_items: {
        Row: {
          created_at: string | null
          description: string
          id: string
          invoice_id: string
          quantity: number
          total: number
          unit_price: number
        }
        Insert: {
          created_at?: string | null
          description: string
          id?: string
          invoice_id: string
          quantity?: number
          total: number
          unit_price: number
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: string
          invoice_id?: string
          quantity?: number
          total?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          created_at: string | null
          customer_address: string | null
          customer_email: string
          customer_name: string
          customer_phone: string | null
          discount: number | null
          due_date: string | null
          id: string
          invoice_number: string
          notes: string | null
          order_id: string | null
          paid_at: string | null
          sent_at: string | null
          status: string
          subtotal: number
          tax: number | null
          total: number
          updated_at: string | null
          viewed_at: string | null
        }
        Insert: {
          created_at?: string | null
          customer_address?: string | null
          customer_email: string
          customer_name: string
          customer_phone?: string | null
          discount?: number | null
          due_date?: string | null
          id?: string
          invoice_number: string
          notes?: string | null
          order_id?: string | null
          paid_at?: string | null
          sent_at?: string | null
          status?: string
          subtotal: number
          tax?: number | null
          total: number
          updated_at?: string | null
          viewed_at?: string | null
        }
        Update: {
          created_at?: string | null
          customer_address?: string | null
          customer_email?: string
          customer_name?: string
          customer_phone?: string | null
          discount?: number | null
          due_date?: string | null
          id?: string
          invoice_number?: string
          notes?: string | null
          order_id?: string | null
          paid_at?: string | null
          sent_at?: string | null
          status?: string
          subtotal?: number
          tax?: number | null
          total?: number
          updated_at?: string | null
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_campaigns: {
        Row: {
          click_count: number | null
          content: string
          created_at: string
          created_by: string | null
          failed_count: number | null
          id: string
          open_count: number | null
          scheduled_at: string | null
          sent_at: string | null
          sent_count: number | null
          status: string
          subject: string
          total_recipients: number | null
          updated_at: string
        }
        Insert: {
          click_count?: number | null
          content: string
          created_at?: string
          created_by?: string | null
          failed_count?: number | null
          id?: string
          open_count?: number | null
          scheduled_at?: string | null
          sent_at?: string | null
          sent_count?: number | null
          status?: string
          subject: string
          total_recipients?: number | null
          updated_at?: string
        }
        Update: {
          click_count?: number | null
          content?: string
          created_at?: string
          created_by?: string | null
          failed_count?: number | null
          id?: string
          open_count?: number | null
          scheduled_at?: string | null
          sent_at?: string | null
          sent_count?: number | null
          status?: string
          subject?: string
          total_recipients?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          email: string
          frequency: string
          id: string
          is_active: boolean
          preferences_token: string | null
          source: string | null
          subscribed_at: string
          topics: string[]
        }
        Insert: {
          email: string
          frequency?: string
          id?: string
          is_active?: boolean
          preferences_token?: string | null
          source?: string | null
          subscribed_at?: string
          topics?: string[]
        }
        Update: {
          email?: string
          frequency?: string
          id?: string
          is_active?: boolean
          preferences_token?: string | null
          source?: string | null
          subscribed_at?: string
          topics?: string[]
        }
        Relationships: []
      }
      newsletter_tracking: {
        Row: {
          campaign_id: string
          created_at: string
          event_type: string
          id: string
          ip_address: string | null
          link_url: string | null
          subscriber_email: string
          user_agent: string | null
        }
        Insert: {
          campaign_id: string
          created_at?: string
          event_type: string
          id?: string
          ip_address?: string | null
          link_url?: string | null
          subscriber_email: string
          user_agent?: string | null
        }
        Update: {
          campaign_id?: string
          created_at?: string
          event_type?: string
          id?: string
          ip_address?: string | null
          link_url?: string | null
          subscriber_email?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "newsletter_tracking_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "newsletter_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      order_installments: {
        Row: {
          created_at: string | null
          id: string
          installments: Json
          order_id: string
          plan_id: string | null
          total_amount: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          installments?: Json
          order_id: string
          plan_id?: string | null
          total_amount: number
        }
        Update: {
          created_at?: string | null
          id?: string
          installments?: Json
          order_id?: string
          plan_id?: string | null
          total_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_installments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_installments_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "payment_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      order_revisions: {
        Row: {
          admin_response: string | null
          created_at: string | null
          id: string
          order_id: string
          request_text: string
          status: string
          updated_at: string | null
        }
        Insert: {
          admin_response?: string | null
          created_at?: string | null
          id?: string
          order_id: string
          request_text: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          admin_response?: string | null
          created_at?: string | null
          id?: string
          order_id?: string
          request_text?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_revisions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_templates: {
        Row: {
          base_price: number | null
          created_at: string | null
          created_by: string | null
          customer_email: string | null
          customer_name: string | null
          default_options: Json | null
          description: string | null
          event_type: string
          id: string
          is_active: boolean | null
          name: string
          package_name: string
          updated_at: string | null
          usage_count: number | null
        }
        Insert: {
          base_price?: number | null
          created_at?: string | null
          created_by?: string | null
          customer_email?: string | null
          customer_name?: string | null
          default_options?: Json | null
          description?: string | null
          event_type: string
          id?: string
          is_active?: boolean | null
          name: string
          package_name: string
          updated_at?: string | null
          usage_count?: number | null
        }
        Update: {
          base_price?: number | null
          created_at?: string | null
          created_by?: string | null
          customer_email?: string | null
          customer_name?: string | null
          default_options?: Json | null
          description?: string | null
          event_type?: string
          id?: string
          is_active?: boolean | null
          name?: string
          package_name?: string
          updated_at?: string | null
          usage_count?: number | null
        }
        Relationships: []
      }
      order_timeline: {
        Row: {
          created_at: string | null
          id: string
          message: string
          metadata: Json | null
          order_id: string
          status: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          metadata?: Json | null
          order_id: string
          status: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          metadata?: Json | null
          order_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_timeline_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          add_ons: Json | null
          balance_amount: number | null
          balance_paid: boolean | null
          balance_paid_at: string | null
          balance_reference: string | null
          client_email: string
          client_name: string
          client_phone: string
          client_whatsapp: string | null
          color_palette: string | null
          couple_names: string | null
          created_at: string
          custom_colors: string[] | null
          delivery_type: string
          deposit_amount: number | null
          deposit_paid: boolean | null
          deposit_paid_at: string | null
          deposit_reference: string | null
          event_date: string | null
          event_time: string | null
          event_title: string
          event_type: string
          id: string
          order_status: Database["public"]["Enums"]["order_status"]
          package_id: string
          package_name: string
          package_price: number
          payment_status: Database["public"]["Enums"]["payment_status"]
          preferred_delivery_date: string | null
          reference_images: string[] | null
          special_message: string | null
          special_requests: string | null
          style_preferences: string[] | null
          total_price: number
          updated_at: string
          venue_address: string | null
          venue_name: string | null
        }
        Insert: {
          add_ons?: Json | null
          balance_amount?: number | null
          balance_paid?: boolean | null
          balance_paid_at?: string | null
          balance_reference?: string | null
          client_email: string
          client_name: string
          client_phone: string
          client_whatsapp?: string | null
          color_palette?: string | null
          couple_names?: string | null
          created_at?: string
          custom_colors?: string[] | null
          delivery_type?: string
          deposit_amount?: number | null
          deposit_paid?: boolean | null
          deposit_paid_at?: string | null
          deposit_reference?: string | null
          event_date?: string | null
          event_time?: string | null
          event_title: string
          event_type: string
          id?: string
          order_status?: Database["public"]["Enums"]["order_status"]
          package_id: string
          package_name: string
          package_price: number
          payment_status?: Database["public"]["Enums"]["payment_status"]
          preferred_delivery_date?: string | null
          reference_images?: string[] | null
          special_message?: string | null
          special_requests?: string | null
          style_preferences?: string[] | null
          total_price: number
          updated_at?: string
          venue_address?: string | null
          venue_name?: string | null
        }
        Update: {
          add_ons?: Json | null
          balance_amount?: number | null
          balance_paid?: boolean | null
          balance_paid_at?: string | null
          balance_reference?: string | null
          client_email?: string
          client_name?: string
          client_phone?: string
          client_whatsapp?: string | null
          color_palette?: string | null
          couple_names?: string | null
          created_at?: string
          custom_colors?: string[] | null
          delivery_type?: string
          deposit_amount?: number | null
          deposit_paid?: boolean | null
          deposit_paid_at?: string | null
          deposit_reference?: string | null
          event_date?: string | null
          event_time?: string | null
          event_title?: string
          event_type?: string
          id?: string
          order_status?: Database["public"]["Enums"]["order_status"]
          package_id?: string
          package_name?: string
          package_price?: number
          payment_status?: Database["public"]["Enums"]["payment_status"]
          preferred_delivery_date?: string | null
          reference_images?: string[] | null
          special_message?: string | null
          special_requests?: string | null
          style_preferences?: string[] | null
          total_price?: number
          updated_at?: string
          venue_address?: string | null
          venue_name?: string | null
        }
        Relationships: []
      }
      page_views: {
        Row: {
          browser: string | null
          city: string | null
          country: string | null
          created_at: string
          device_type: string | null
          id: string
          os: string | null
          page_path: string
          page_title: string | null
          referrer: string | null
          screen_height: number | null
          screen_width: number | null
          session_id: string | null
          time_spent: number | null
          user_agent: string | null
        }
        Insert: {
          browser?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          device_type?: string | null
          id?: string
          os?: string | null
          page_path: string
          page_title?: string | null
          referrer?: string | null
          screen_height?: number | null
          screen_width?: number | null
          session_id?: string | null
          time_spent?: number | null
          user_agent?: string | null
        }
        Update: {
          browser?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          device_type?: string | null
          id?: string
          os?: string | null
          page_path?: string
          page_title?: string | null
          referrer?: string | null
          screen_height?: number | null
          screen_width?: number | null
          session_id?: string | null
          time_spent?: number | null
          user_agent?: string | null
        }
        Relationships: []
      }
      payment_history: {
        Row: {
          amount: number
          created_at: string
          id: string
          notes: string | null
          order_id: string
          payment_method: string
          payment_type: string
          recorded_by: string | null
          reference: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          notes?: string | null
          order_id: string
          payment_method: string
          payment_type: string
          recorded_by?: string | null
          reference?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          notes?: string | null
          order_id?: string
          payment_method?: string
          payment_type?: string
          recorded_by?: string | null
          reference?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_history_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_plans: {
        Row: {
          created_at: string | null
          description: string | null
          first_payment_percent: number
          id: string
          installments: number
          interval_days: number
          is_active: boolean | null
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          first_payment_percent: number
          id?: string
          installments: number
          interval_days: number
          is_active?: boolean | null
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          first_payment_percent?: number
          id?: string
          installments?: number
          interval_days?: number
          is_active?: boolean | null
          name?: string
        }
        Relationships: []
      }
      payment_reminder_logs: {
        Row: {
          error_message: string | null
          id: string
          order_id: string
          recipient_email: string
          reminder_type: string
          sent_at: string
          success: boolean
        }
        Insert: {
          error_message?: string | null
          id?: string
          order_id: string
          recipient_email: string
          reminder_type: string
          sent_at?: string
          success?: boolean
        }
        Update: {
          error_message?: string | null
          id?: string
          order_id?: string
          recipient_email?: string
          reminder_type?: string
          sent_at?: string
          success?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "payment_reminder_logs_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      rate_limit_logs: {
        Row: {
          client_ip: string
          created_at: string
          function_name: string
          id: string
        }
        Insert: {
          client_ip: string
          created_at?: string
          function_name: string
          id?: string
        }
        Update: {
          client_ip?: string
          created_at?: string
          function_name?: string
          id?: string
        }
        Relationships: []
      }
      referral_codes: {
        Row: {
          available_balance: number | null
          code: string
          created_at: string | null
          id: string
          is_active: boolean | null
          owner_email: string
          owner_name: string
          pending_referrals: number | null
          reward_percentage: number | null
          successful_referrals: number | null
          total_earnings: number | null
          total_referrals: number | null
        }
        Insert: {
          available_balance?: number | null
          code: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          owner_email: string
          owner_name: string
          pending_referrals?: number | null
          reward_percentage?: number | null
          successful_referrals?: number | null
          total_earnings?: number | null
          total_referrals?: number | null
        }
        Update: {
          available_balance?: number | null
          code?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          owner_email?: string
          owner_name?: string
          pending_referrals?: number | null
          reward_percentage?: number | null
          successful_referrals?: number | null
          total_earnings?: number | null
          total_referrals?: number | null
        }
        Relationships: []
      }
      referrals: {
        Row: {
          completed_at: string | null
          created_at: string | null
          id: string
          order_id: string | null
          referral_code: string
          referred_email: string
          referrer_email: string
          reward_amount: number | null
          status: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          order_id?: string | null
          referral_code: string
          referred_email: string
          referrer_email: string
          reward_amount?: number | null
          status?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          order_id?: string | null
          referral_code?: string
          referred_email?: string
          referrer_email?: string
          reward_amount?: number | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "referrals_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_designs: {
        Row: {
          created_at: string | null
          customer_email: string
          design_name: string
          design_type: string
          design_url: string | null
          id: string
          notes: string | null
          preview_url: string | null
        }
        Insert: {
          created_at?: string | null
          customer_email: string
          design_name: string
          design_type: string
          design_url?: string | null
          id?: string
          notes?: string | null
          preview_url?: string | null
        }
        Update: {
          created_at?: string | null
          customer_email?: string
          design_name?: string
          design_type?: string
          design_url?: string | null
          id?: string
          notes?: string | null
          preview_url?: string | null
        }
        Relationships: []
      }
      survey_responses: {
        Row: {
          allow_testimonial: boolean | null
          communication: number | null
          created_at: string | null
          delivery_speed: number | null
          design_quality: number | null
          feedback_text: string | null
          id: string
          overall_rating: number
          survey_id: string
          value_for_money: number | null
        }
        Insert: {
          allow_testimonial?: boolean | null
          communication?: number | null
          created_at?: string | null
          delivery_speed?: number | null
          design_quality?: number | null
          feedback_text?: string | null
          id?: string
          overall_rating: number
          survey_id: string
          value_for_money?: number | null
        }
        Update: {
          allow_testimonial?: boolean | null
          communication?: number | null
          created_at?: string | null
          delivery_speed?: number | null
          design_quality?: number | null
          feedback_text?: string | null
          id?: string
          overall_rating?: number
          survey_id?: string
          value_for_money?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "survey_responses_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: false
            referencedRelation: "surveys"
            referencedColumns: ["id"]
          },
        ]
      }
      surveys: {
        Row: {
          completed_at: string | null
          created_at: string | null
          customer_email: string
          customer_name: string
          expires_at: string | null
          id: string
          order_id: string | null
          sent_at: string | null
          status: string
          token: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          customer_email: string
          customer_name: string
          expires_at?: string | null
          id?: string
          order_id?: string | null
          sent_at?: string | null
          status?: string
          token: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          customer_email?: string
          customer_name?: string
          expires_at?: string | null
          id?: string
          order_id?: string | null
          sent_at?: string | null
          status?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "surveys_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          bio: string | null
          created_at: string
          display_order: number
          email: string | null
          id: string
          is_active: boolean
          name: string
          phone: string | null
          photo_url: string | null
          role: string
          social_facebook: string | null
          social_instagram: string | null
          social_linkedin: string | null
          social_twitter: string | null
          updated_at: string
        }
        Insert: {
          bio?: string | null
          created_at?: string
          display_order?: number
          email?: string | null
          id?: string
          is_active?: boolean
          name: string
          phone?: string | null
          photo_url?: string | null
          role: string
          social_facebook?: string | null
          social_instagram?: string | null
          social_linkedin?: string | null
          social_twitter?: string | null
          updated_at?: string
        }
        Update: {
          bio?: string | null
          created_at?: string
          display_order?: number
          email?: string | null
          id?: string
          is_active?: boolean
          name?: string
          phone?: string | null
          photo_url?: string | null
          role?: string
          social_facebook?: string | null
          social_instagram?: string | null
          social_linkedin?: string | null
          social_twitter?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          created_at: string
          display_order: number
          event_type: string
          featured: boolean
          id: string
          image_url: string | null
          name: string
          quote: string
          rating: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          event_type: string
          featured?: boolean
          id?: string
          image_url?: string | null
          name: string
          quote: string
          rating?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_order?: number
          event_type?: string
          featured?: boolean
          id?: string
          image_url?: string | null
          name?: string
          quote?: string
          rating?: number
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_totp_secrets: {
        Row: {
          backup_codes: string[] | null
          created_at: string
          encrypted_secret: string
          id: string
          is_enabled: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          backup_codes?: string[] | null
          created_at?: string
          encrypted_secret: string
          id?: string
          is_enabled?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          backup_codes?: string[] | null
          created_at?: string
          encrypted_secret?: string
          id?: string
          is_enabled?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_rate_limit: {
        Args: {
          p_client_ip: string
          p_function_name: string
          p_max_requests: number
          p_window_minutes: number
        }
        Returns: boolean
      }
      cleanup_rate_limit_logs: { Args: never; Returns: undefined }
      get_order_by_id: {
        Args: { customer_email?: string; order_id: string }
        Returns: {
          balance_paid: boolean
          client_email: string
          created_at: string
          deposit_paid: boolean
          event_date: string
          event_title: string
          event_type: string
          id: string
          order_status: string
          package_name: string
          payment_status: string
          preferred_delivery_date: string
          total_price: number
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_campaign_click_count: {
        Args: { campaign_uuid: string }
        Returns: undefined
      }
      increment_campaign_open_count: {
        Args: { campaign_uuid: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "user"
      order_status:
        | "pending"
        | "in_progress"
        | "draft_ready"
        | "revision"
        | "completed"
        | "cancelled"
      payment_status: "pending" | "deposit_paid" | "fully_paid"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
      order_status: [
        "pending",
        "in_progress",
        "draft_ready",
        "revision",
        "completed",
        "cancelled",
      ],
      payment_status: ["pending", "deposit_paid", "fully_paid"],
    },
  },
} as const
