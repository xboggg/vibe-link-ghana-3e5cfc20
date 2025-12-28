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
      orders: {
        Row: {
          add_ons: Json | null
          client_email: string
          client_name: string
          client_phone: string
          client_whatsapp: string | null
          color_palette: string | null
          couple_names: string | null
          created_at: string
          custom_colors: string[] | null
          delivery_type: string
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
          client_email: string
          client_name: string
          client_phone: string
          client_whatsapp?: string | null
          color_palette?: string | null
          couple_names?: string | null
          created_at?: string
          custom_colors?: string[] | null
          delivery_type?: string
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
          client_email?: string
          client_name?: string
          client_phone?: string
          client_whatsapp?: string | null
          color_palette?: string | null
          couple_names?: string | null
          created_at?: string
          custom_colors?: string[] | null
          delivery_type?: string
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
          city: string | null
          country: string | null
          created_at: string
          id: string
          page_path: string
          page_title: string | null
          referrer: string | null
          session_id: string | null
          user_agent: string | null
        }
        Insert: {
          city?: string | null
          country?: string | null
          created_at?: string
          id?: string
          page_path: string
          page_title?: string | null
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
        }
        Update: {
          city?: string | null
          country?: string | null
          created_at?: string
          id?: string
          page_path?: string
          page_title?: string | null
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
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
      get_order_by_id:
        | {
            Args: { order_id: string }
            Returns: {
              created_at: string
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
        | {
            Args: { customer_email?: string; order_id: string }
            Returns: {
              created_at: string
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
