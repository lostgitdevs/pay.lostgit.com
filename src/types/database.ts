export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = 'owner' | 'admin' | 'finance' | 'support' | 'client';
export type InvoiceStatus = 'draft' | 'issued' | 'sent' | 'partially_paid' | 'paid' | 'overdue' | 'cancelled' | 'refunded' | 'void';
export type PaymentStatus = 'pending' | 'authorized' | 'captured' | 'failed' | 'refunded' | 'partially_refunded';
export type InstalmentStatus = 'scheduled' | 'due' | 'paid' | 'partially_paid' | 'overdue' | 'cancelled';
export type SubscriptionStatus = 'created' | 'authenticated' | 'active' | 'pending' | 'halted' | 'paused' | 'cancelled' | 'completed' | 'expired';
export type ProjectStatus = 'proposal' | 'active' | 'on_hold' | 'completed' | 'cancelled';
export type ClientStatus = 'active' | 'inactive' | 'suspended' | 'invited';
export type EntitlementStatus = 'active' | 'grace_period' | 'pending_review' | 'suspended' | 'restored' | 'expired' | 'revoked';
export type LicenceStatus = 'active' | 'expired' | 'revoked' | 'rotated';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          role: UserRole;
          client_id: string | null;
          phone: string | null;
          avatar_url: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name: string;
          role?: UserRole;
          client_id?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          role?: UserRole;
          client_id?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          is_active?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      clients: {
        Row: {
          id: string;
          business_name: string;
          contact_name: string;
          email: string;
          phone: string | null;
          billing_address: Json;
          tax_id: string | null;
          status: ClientStatus;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          business_name: string;
          contact_name: string;
          email: string;
          phone?: string | null;
          billing_address?: Json;
          tax_id?: string | null;
          status?: ClientStatus;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          business_name?: string;
          contact_name?: string;
          email?: string;
          phone?: string | null;
          billing_address?: Json;
          tax_id?: string | null;
          status?: ClientStatus;
          notes?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      projects: {
        Row: {
          id: string;
          client_id: string;
          name: string;
          description: string | null;
          project_type: string;
          status: ProjectStatus;
          total_value_paise: number;
          currency: string;
          start_date: string | null;
          end_date: string | null;
          licence_key: string | null;
          entitlement_status: EntitlementStatus;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          name: string;
          description?: string | null;
          project_type?: string;
          status?: ProjectStatus;
          total_value_paise?: number;
          currency?: string;
          start_date?: string | null;
          end_date?: string | null;
          licence_key?: string | null;
          entitlement_status?: EntitlementStatus;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          client_id?: string;
          name?: string;
          description?: string | null;
          project_type?: string;
          status?: ProjectStatus;
          total_value_paise?: number;
          currency?: string;
          start_date?: string | null;
          end_date?: string | null;
          licence_key?: string | null;
          entitlement_status?: EntitlementStatus;
          metadata?: Json;
          updated_at?: string;
        };
        Relationships: [];
      };
      invoices: {
        Row: {
          id: string;
          invoice_number: string;
          client_id: string;
          project_id: string | null;
          invoice_type: string;
          status: InvoiceStatus;
          subtotal_paise: number;
          tax_rate_percent: number;
          tax_amount_paise: number;
          discount_amount_paise: number;
          total_amount_paise: number;
          amount_paid_paise: number;
          currency: string;
          issue_date: string;
          due_date: string;
          payment_link_token: string | null;
          payment_link_expires_at: string | null;
          razorpay_order_id: string | null;
          notes: string | null;
          terms: string | null;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          invoice_number: string;
          client_id: string;
          project_id?: string | null;
          invoice_type?: string;
          status?: InvoiceStatus;
          subtotal_paise?: number;
          tax_rate_percent?: number;
          tax_amount_paise?: number;
          discount_amount_paise?: number;
          total_amount_paise?: number;
          amount_paid_paise?: number;
          currency?: string;
          issue_date?: string;
          due_date: string;
          payment_link_token?: string | null;
          payment_link_expires_at?: string | null;
          razorpay_order_id?: string | null;
          notes?: string | null;
          terms?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          invoice_number?: string;
          client_id?: string;
          project_id?: string | null;
          invoice_type?: string;
          status?: InvoiceStatus;
          subtotal_paise?: number;
          tax_rate_percent?: number;
          tax_amount_paise?: number;
          discount_amount_paise?: number;
          total_amount_paise?: number;
          amount_paid_paise?: number;
          currency?: string;
          issue_date?: string;
          due_date?: string;
          payment_link_token?: string | null;
          payment_link_expires_at?: string | null;
          razorpay_order_id?: string | null;
          notes?: string | null;
          terms?: string | null;
          metadata?: Json;
          updated_at?: string;
        };
        Relationships: [];
      };
      invoice_items: {
        Row: {
          id: string;
          invoice_id: string;
          description: string;
          quantity: number;
          unit_price_paise: number;
          total_paise: number;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          invoice_id: string;
          description: string;
          quantity?: number;
          unit_price_paise: number;
          total_paise: number;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          invoice_id?: string;
          description?: string;
          quantity?: number;
          unit_price_paise?: number;
          total_paise?: number;
          sort_order?: number;
        };
        Relationships: [];
      };
      payment_plans: {
        Row: {
          id: string;
          invoice_id: string;
          client_id: string;
          project_id: string | null;
          total_amount_paise: number;
          number_of_instalments: number;
          frequency: string;
          status: string;
          terms: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          invoice_id: string;
          client_id: string;
          project_id?: string | null;
          total_amount_paise: number;
          number_of_instalments: number;
          frequency?: string;
          status?: string;
          terms?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          invoice_id?: string;
          client_id?: string;
          project_id?: string | null;
          total_amount_paise?: number;
          number_of_instalments?: number;
          frequency?: string;
          status?: string;
          terms?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      instalments: {
        Row: {
          id: string;
          payment_plan_id: string;
          instalment_number: number;
          amount_paise: number;
          due_date: string;
          status: InstalmentStatus;
          amount_paid_paise: number;
          razorpay_order_id: string | null;
          razorpay_payment_id: string | null;
          payment_link_token: string | null;
          paid_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          payment_plan_id: string;
          instalment_number: number;
          amount_paise: number;
          due_date: string;
          status?: InstalmentStatus;
          amount_paid_paise?: number;
          razorpay_order_id?: string | null;
          razorpay_payment_id?: string | null;
          payment_link_token?: string | null;
          paid_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          payment_plan_id?: string;
          instalment_number?: number;
          amount_paise?: number;
          due_date?: string;
          status?: InstalmentStatus;
          amount_paid_paise?: number;
          razorpay_order_id?: string | null;
          razorpay_payment_id?: string | null;
          payment_link_token?: string | null;
          paid_at?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      subscriptions: {
        Row: {
          id: string;
          client_id: string;
          project_id: string | null;
          plan_name: string;
          razorpay_plan_id: string | null;
          razorpay_subscription_id: string | null;
          status: SubscriptionStatus;
          billing_frequency: string;
          amount_paise: number;
          currency: string;
          current_start: string | null;
          current_end: string | null;
          next_billing_at: string | null;
          charge_at: string | null;
          failure_count: number;
          cancellation_reason: string | null;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          project_id?: string | null;
          plan_name: string;
          razorpay_plan_id?: string | null;
          razorpay_subscription_id?: string | null;
          status?: SubscriptionStatus;
          billing_frequency?: string;
          amount_paise: number;
          currency?: string;
          current_start?: string | null;
          current_end?: string | null;
          next_billing_at?: string | null;
          charge_at?: string | null;
          failure_count?: number;
          cancellation_reason?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          client_id?: string;
          project_id?: string | null;
          plan_name?: string;
          razorpay_plan_id?: string | null;
          razorpay_subscription_id?: string | null;
          status?: SubscriptionStatus;
          billing_frequency?: string;
          amount_paise?: number;
          currency?: string;
          current_start?: string | null;
          current_end?: string | null;
          next_billing_at?: string | null;
          charge_at?: string | null;
          failure_count?: number;
          cancellation_reason?: string | null;
          metadata?: Json;
          updated_at?: string;
        };
        Relationships: [];
      };
      payments: {
        Row: {
          id: string;
          invoice_id: string | null;
          instalment_id: string | null;
          subscription_id: string | null;
          client_id: string;
          amount_paise: number;
          currency: string;
          payment_method: string | null;
          razorpay_order_id: string | null;
          razorpay_payment_id: string | null;
          razorpay_signature: string | null;
          status: PaymentStatus;
          error_code: string | null;
          error_description: string | null;
          receipt_number: string | null;
          captured_at: string | null;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          invoice_id?: string | null;
          instalment_id?: string | null;
          subscription_id?: string | null;
          client_id: string;
          amount_paise: number;
          currency?: string;
          payment_method?: string | null;
          razorpay_order_id?: string | null;
          razorpay_payment_id?: string | null;
          razorpay_signature?: string | null;
          status?: PaymentStatus;
          error_code?: string | null;
          error_description?: string | null;
          receipt_number?: string | null;
          captured_at?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          invoice_id?: string | null;
          instalment_id?: string | null;
          subscription_id?: string | null;
          client_id?: string;
          amount_paise?: number;
          currency?: string;
          payment_method?: string | null;
          razorpay_order_id?: string | null;
          razorpay_payment_id?: string | null;
          razorpay_signature?: string | null;
          status?: PaymentStatus;
          error_code?: string | null;
          error_description?: string | null;
          receipt_number?: string | null;
          captured_at?: string | null;
          metadata?: Json;
          updated_at?: string;
        };
        Relationships: [];
      };
      refunds: {
        Row: {
          id: string;
          payment_id: string;
          razorpay_refund_id: string | null;
          amount_paise: number;
          reason: string | null;
          status: string;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          payment_id: string;
          razorpay_refund_id?: string | null;
          amount_paise: number;
          reason?: string | null;
          status?: string;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          payment_id?: string;
          razorpay_refund_id?: string | null;
          amount_paise?: number;
          reason?: string | null;
          status?: string;
          created_by?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      webhook_events: {
        Row: {
          id: string;
          event_id: string;
          event_type: string;
          payload: Json;
          status: string;
          error_message: string | null;
          processed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          event_type: string;
          payload: Json;
          status?: string;
          error_message?: string | null;
          processed_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          event_type?: string;
          payload?: Json;
          status?: string;
          error_message?: string | null;
          processed_at?: string | null;
        };
        Relationships: [];
      };
      licences: {
        Row: {
          id: string;
          project_id: string;
          client_id: string;
          licence_key: string;
          status: LicenceStatus;
          allowed_domains: string[];
          valid_until: string | null;
          grace_period_until: string | null;
          last_checked_at: string | null;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          client_id: string;
          licence_key: string;
          status?: LicenceStatus;
          allowed_domains?: string[];
          valid_until?: string | null;
          grace_period_until?: string | null;
          last_checked_at?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          client_id?: string;
          licence_key?: string;
          status?: LicenceStatus;
          allowed_domains?: string[];
          valid_until?: string | null;
          grace_period_until?: string | null;
          last_checked_at?: string | null;
          metadata?: Json;
          updated_at?: string;
        };
        Relationships: [];
      };
      audit_logs: {
        Row: {
          id: string;
          user_id: string | null;
          action: string;
          entity_type: string;
          entity_id: string | null;
          details: Json;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          action: string;
          entity_type: string;
          entity_id?: string | null;
          details?: Json;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          action?: string;
          entity_type?: string;
          entity_id?: string | null;
          details?: Json;
          ip_address?: string | null;
          user_agent?: string | null;
        };
        Relationships: [];
      };
      business_settings: {
        Row: {
          id: number;
          company_name: string;
          company_email: string;
          company_phone: string | null;
          company_website: string | null;
          company_address: Json;
          gstin: string | null;
          pan: string | null;
          default_tax_rate: number;
          invoice_prefix: string;
          receipt_prefix: string;
          default_payment_terms_days: number;
          default_grace_period_days: number;
          default_terms: string | null;
          bank_details: Json;
          razorpay_live_configured: boolean;
          updated_at: string;
        };
        Insert: {
          id?: number;
          company_name?: string;
          company_email?: string;
          company_phone?: string | null;
          company_website?: string | null;
          company_address?: Json;
          gstin?: string | null;
          pan?: string | null;
          default_tax_rate?: number;
          invoice_prefix?: string;
          receipt_prefix?: string;
          default_payment_terms_days?: number;
          default_grace_period_days?: number;
          default_terms?: string | null;
          bank_details?: Json;
          razorpay_live_configured?: boolean;
          updated_at?: string;
        };
        Update: {
          id?: number;
          company_name?: string;
          company_email?: string;
          company_phone?: string | null;
          company_website?: string | null;
          company_address?: Json;
          gstin?: string | null;
          pan?: string | null;
          default_tax_rate?: number;
          invoice_prefix?: string;
          receipt_prefix?: string;
          default_payment_terms_days?: number;
          default_grace_period_days?: number;
          default_terms?: string | null;
          bank_details?: Json;
          razorpay_live_configured?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      analytics_events: {
        Row: {
          id: string;
          project_id: string;
          event_type: 'pageview' | 'click' | 'heartbeat' | 'session_end' | 'error';
          session_id: string;
          visitor_hash: string;
          path: string;
          title: string | null;
          referrer: string | null;
          device_category: 'desktop' | 'mobile' | 'tablet' | null;
          browser: string | null;
          duration_seconds: number;
          element_tag: string | null;
          element_id: string | null;
          element_text: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          event_type: 'pageview' | 'click' | 'heartbeat' | 'session_end' | 'error';
          session_id: string;
          visitor_hash: string;
          path: string;
          title?: string | null;
          referrer?: string | null;
          device_category?: 'desktop' | 'mobile' | 'tablet' | null;
          browser?: string | null;
          duration_seconds?: number;
          element_tag?: string | null;
          element_id?: string | null;
          element_text?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          event_type?: 'pageview' | 'click' | 'heartbeat' | 'session_end' | 'error';
          session_id?: string;
          visitor_hash?: string;
          path?: string;
          title?: string | null;
          referrer?: string | null;
          device_category?: 'desktop' | 'mobile' | 'tablet' | null;
          browser?: string | null;
          duration_seconds?: number;
          element_tag?: string | null;
          element_id?: string | null;
          element_text?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Relationships: [];
      };
      analytics_sessions: {
        Row: {
          id: string;
          project_id: string;
          session_id: string;
          visitor_hash: string;
          entry_path: string;
          exit_path: string | null;
          page_views_count: number;
          total_duration_seconds: number;
          is_bounce: boolean;
          started_at: string;
          ended_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          session_id: string;
          visitor_hash: string;
          entry_path: string;
          exit_path?: string | null;
          page_views_count?: number;
          total_duration_seconds?: number;
          is_bounce?: boolean;
          started_at?: string;
          ended_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          session_id?: string;
          visitor_hash?: string;
          entry_path?: string;
          exit_path?: string | null;
          page_views_count?: number;
          total_duration_seconds?: number;
          is_bounce?: boolean;
          started_at?: string;
          ended_at?: string;
        };
        Relationships: [];
      };
      project_integrations: {
        Row: {
          id: string;
          project_id: string;
          sdk_version: string;
          status: 'healthy' | 'degraded' | 'offline';
          last_ping_at: string;
          latency_ms: number;
          error_count: number;
          last_error: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          sdk_version?: string;
          status?: 'healthy' | 'degraded' | 'offline';
          last_ping_at?: string;
          latency_ms?: number;
          error_count?: number;
          last_error?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          sdk_version?: string;
          status?: 'healthy' | 'degraded' | 'offline';
          last_ping_at?: string;
          latency_ms?: number;
          error_count?: number;
          last_error?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
