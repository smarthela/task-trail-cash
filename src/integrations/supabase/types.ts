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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      admin_actions: {
        Row: {
          action: string
          admin_id: string
          created_at: string
          details: Json
          id: string
          target_id: string | null
          target_type: string
        }
        Insert: {
          action: string
          admin_id: string
          created_at?: string
          details?: Json
          id?: string
          target_id?: string | null
          target_type: string
        }
        Update: {
          action?: string
          admin_id?: string
          created_at?: string
          details?: Json
          id?: string
          target_id?: string | null
          target_type?: string
        }
        Relationships: []
      }
      badges: {
        Row: {
          code: string
          description: string | null
          icon: string | null
          id: string
          name: string
        }
        Insert: {
          code: string
          description?: string | null
          icon?: string | null
          id?: string
          name: string
        }
        Update: {
          code?: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      campaign_participants: {
        Row: {
          actions_completed: number
          campaign_id: string
          id: string
          joined_at: string
          user_id: string
        }
        Insert: {
          actions_completed?: number
          campaign_id: string
          id?: string
          joined_at?: string
          user_id: string
        }
        Update: {
          actions_completed?: number
          campaign_id?: string
          id?: string
          joined_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_participants_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          allocated: number
          budget: number
          campaign_type: string
          created_at: string
          description: string
          ends_at: string | null
          funded: number
          id: string
          instructions: string | null
          name: string
          objective: string | null
          owner_id: string
          participants_target: number | null
          reward_per_action: number
          spent: number
          starts_at: string | null
          status: string
          target_audience: string | null
          verification_requirements: string | null
        }
        Insert: {
          allocated?: number
          budget?: number
          campaign_type?: string
          created_at?: string
          description?: string
          ends_at?: string | null
          funded?: number
          id?: string
          instructions?: string | null
          name: string
          objective?: string | null
          owner_id: string
          participants_target?: number | null
          reward_per_action?: number
          spent?: number
          starts_at?: string | null
          status?: string
          target_audience?: string | null
          verification_requirements?: string | null
        }
        Update: {
          allocated?: number
          budget?: number
          campaign_type?: string
          created_at?: string
          description?: string
          ends_at?: string | null
          funded?: number
          id?: string
          instructions?: string | null
          name?: string
          objective?: string | null
          owner_id?: string
          participants_target?: number | null
          reward_per_action?: number
          spent?: number
          starts_at?: string | null
          status?: string
          target_audience?: string | null
          verification_requirements?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      challenges: {
        Row: {
          active: boolean
          created_at: string
          description: string | null
          id: string
          metric: string
          reward: number
          target: number
          title: string
          xp: number
        }
        Insert: {
          active?: boolean
          created_at?: string
          description?: string | null
          id?: string
          metric: string
          reward?: number
          target: number
          title: string
          xp?: number
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: string | null
          id?: string
          metric?: string
          reward?: number
          target?: number
          title?: string
          xp?: number
        }
        Relationships: []
      }
      contracts: {
        Row: {
          amount: number
          application_id: string | null
          client_id: string
          created_at: string
          freelancer_id: string
          id: string
          job_id: string
          status: string
        }
        Insert: {
          amount: number
          application_id?: string | null
          client_id: string
          created_at?: string
          freelancer_id: string
          id?: string
          job_id: string
          status?: string
        }
        Update: {
          amount?: number
          application_id?: string | null
          client_id?: string
          created_at?: string
          freelancer_id?: string
          id?: string
          job_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "contracts_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "freelance_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_freelancer_id_fkey"
            columns: ["freelancer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "freelance_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      deal_clicks: {
        Row: {
          created_at: string
          deal_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          deal_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          deal_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "deal_clicks_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_clicks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      deals: {
        Row: {
          active: boolean
          created_at: string
          deal_type: string
          description: string
          expires_at: string | null
          id: string
          promo_code: string | null
          provider: string
          requirements: string | null
          reward_text: string
          title: string
          url: string | null
          verification: string | null
        }
        Insert: {
          active?: boolean
          created_at?: string
          deal_type?: string
          description?: string
          expires_at?: string | null
          id?: string
          promo_code?: string | null
          provider: string
          requirements?: string | null
          reward_text: string
          title: string
          url?: string | null
          verification?: string | null
        }
        Update: {
          active?: boolean
          created_at?: string
          deal_type?: string
          description?: string
          expires_at?: string | null
          id?: string
          promo_code?: string | null
          provider?: string
          requirements?: string | null
          reward_text?: string
          title?: string
          url?: string | null
          verification?: string | null
        }
        Relationships: []
      }
      earning_link_clicks: {
        Row: {
          created_at: string
          id: string
          link_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          link_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          link_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "earning_link_clicks_link_id_fkey"
            columns: ["link_id"]
            isOneToOne: false
            referencedRelation: "earning_links"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "earning_link_clicks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      earning_link_submissions: {
        Row: {
          created_at: string
          id: string
          link_id: string
          proof_text: string | null
          proof_url: string | null
          review_note: string | null
          reviewed_at: string | null
          reviewer_id: string | null
          reward: number
          status: string
          transaction_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          link_id: string
          proof_text?: string | null
          proof_url?: string | null
          review_note?: string | null
          reviewed_at?: string | null
          reviewer_id?: string | null
          reward: number
          status?: string
          transaction_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          link_id?: string
          proof_text?: string | null
          proof_url?: string | null
          review_note?: string | null
          reviewed_at?: string | null
          reviewer_id?: string | null
          reward?: number
          status?: string
          transaction_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "earning_link_submissions_link_id_fkey"
            columns: ["link_id"]
            isOneToOne: false
            referencedRelation: "earning_links"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "earning_link_submissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      earning_links: {
        Row: {
          completions_count: number
          created_at: string
          created_by: string | null
          description: string
          expires_at: string | null
          id: string
          instructions: string
          kind: string
          max_completions: number | null
          reward: number
          risk_note: string | null
          section: string
          status: string
          title: string
          updated_at: string
          url: string
          verification: string
          verification_status: string
        }
        Insert: {
          completions_count?: number
          created_at?: string
          created_by?: string | null
          description?: string
          expires_at?: string | null
          id?: string
          instructions?: string
          kind: string
          max_completions?: number | null
          reward?: number
          risk_note?: string | null
          section?: string
          status?: string
          title: string
          updated_at?: string
          url: string
          verification?: string
          verification_status?: string
        }
        Update: {
          completions_count?: number
          created_at?: string
          created_by?: string | null
          description?: string
          expires_at?: string | null
          id?: string
          instructions?: string
          kind?: string
          max_completions?: number | null
          reward?: number
          risk_note?: string | null
          section?: string
          status?: string
          title?: string
          updated_at?: string
          url?: string
          verification?: string
          verification_status?: string
        }
        Relationships: []
      }
      fraud_flags: {
        Row: {
          created_at: string
          details: Json
          id: string
          kind: string
          resolved_by: string | null
          severity: string
          status: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          details?: Json
          id?: string
          kind: string
          resolved_by?: string | null
          severity?: string
          status?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          details?: Json
          id?: string
          kind?: string
          resolved_by?: string | null
          severity?: string
          status?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fraud_flags_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      freelance_applications: {
        Row: {
          cover_letter: string
          created_at: string
          freelancer_id: string
          id: string
          job_id: string
          proposed_amount: number
          status: string
        }
        Insert: {
          cover_letter: string
          created_at?: string
          freelancer_id: string
          id?: string
          job_id: string
          proposed_amount: number
          status?: string
        }
        Update: {
          cover_letter?: string
          created_at?: string
          freelancer_id?: string
          id?: string
          job_id?: string
          proposed_amount?: number
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "freelance_applications_freelancer_id_fkey"
            columns: ["freelancer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "freelance_applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "freelance_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      freelance_jobs: {
        Row: {
          budget_max: number
          budget_min: number | null
          budget_type: string
          category: string
          client_id: string
          created_at: string
          deadline: string | null
          description: string
          funded: boolean
          id: string
          skills: string[]
          status: string
          title: string
        }
        Insert: {
          budget_max: number
          budget_min?: number | null
          budget_type?: string
          category?: string
          client_id: string
          created_at?: string
          deadline?: string | null
          description: string
          funded?: boolean
          id?: string
          skills?: string[]
          status?: string
          title: string
        }
        Update: {
          budget_max?: number
          budget_min?: number | null
          budget_type?: string
          category?: string
          client_id?: string
          created_at?: string
          deadline?: string | null
          description?: string
          funded?: boolean
          id?: string
          skills?: string[]
          status?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "freelance_jobs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_orders: {
        Row: {
          amount: number
          buyer_id: string
          commission: number
          created_at: string
          id: string
          product_id: string
          seller_id: string
          status: string
        }
        Insert: {
          amount: number
          buyer_id: string
          commission?: number
          created_at?: string
          id?: string
          product_id: string
          seller_id: string
          status?: string
        }
        Update: {
          amount?: number
          buyer_id?: string
          commission?: number
          created_at?: string
          id?: string
          product_id?: string
          seller_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_orders_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_orders_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "marketplace_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_orders_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_products: {
        Row: {
          category: string
          created_at: string
          description: string
          file_path: string | null
          id: string
          preview_url: string | null
          price: number
          sales_count: number
          seller_id: string
          status: string
          title: string
        }
        Insert: {
          category?: string
          created_at?: string
          description: string
          file_path?: string | null
          id?: string
          preview_url?: string | null
          price: number
          sales_count?: number
          seller_id: string
          status?: string
          title: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          file_path?: string | null
          id?: string
          preview_url?: string | null
          price?: number
          sales_count?: number
          seller_id?: string
          status?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_products_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_reviews: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          product_id: string
          rating: number
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          product_id: string
          rating: number
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          product_id?: string
          rating?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "marketplace_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      milestones: {
        Row: {
          amount: number
          contract_id: string
          created_at: string
          due_date: string | null
          id: string
          status: string
          submission: string | null
          title: string
        }
        Insert: {
          amount: number
          contract_id: string
          created_at?: string
          due_date?: string | null
          id?: string
          status?: string
          submission?: string | null
          title: string
        }
        Update: {
          amount?: number
          contract_id?: string
          created_at?: string
          due_date?: string | null
          id?: string
          status?: string
          submission?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "milestones_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          kind: string
          link: string | null
          read_at: string | null
          title: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          kind: string
          link?: string | null
          read_at?: string | null
          title: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          kind?: string
          link?: string | null
          read_at?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_methods: {
        Row: {
          account_name: string
          account_number: string
          created_at: string
          id: string
          is_default: boolean
          method: string
          user_id: string
        }
        Insert: {
          account_name: string
          account_number: string
          created_at?: string
          id?: string
          is_default?: boolean
          method?: string
          user_id: string
        }
        Update: {
          account_name?: string
          account_number?: string
          created_at?: string
          id?: string
          is_default?: boolean
          method?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_methods_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_ledger: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          id: string
          kind: string
          reference: string | null
          related_id: string | null
          source: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          id?: string
          kind: string
          reference?: string | null
          related_id?: string | null
          source: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          kind?: string
          reference?: string | null
          related_id?: string | null
          source?: string
        }
        Relationships: []
      }
      platform_settings: {
        Row: {
          description: string | null
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          description?: string | null
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          description?: string | null
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          full_name: string | null
          hourly_rate: number | null
          id: string
          location: string | null
          portfolio: Json
          referral_code: string
          referred_by: string | null
          skills: string[]
          status: string
          updated_at: string
          username: string | null
          xp: number
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          full_name?: string | null
          hourly_rate?: number | null
          id: string
          location?: string | null
          portfolio?: Json
          referral_code: string
          referred_by?: string | null
          skills?: string[]
          status?: string
          updated_at?: string
          username?: string | null
          xp?: number
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          full_name?: string | null
          hourly_rate?: number | null
          id?: string
          location?: string | null
          portfolio?: Json
          referral_code?: string
          referred_by?: string | null
          skills?: string[]
          status?: string
          updated_at?: string
          username?: string | null
          xp?: number
        }
        Relationships: []
      }
      referral_rewards: {
        Row: {
          amount: number
          created_at: string
          id: string
          referral_id: string
          transaction_id: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          referral_id: string
          transaction_id?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          referral_id?: string
          transaction_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "referral_rewards_referral_id_fkey"
            columns: ["referral_id"]
            isOneToOne: false
            referencedRelation: "referrals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referral_rewards_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          created_at: string
          id: string
          qualified_at: string | null
          referee_id: string
          referrer_id: string
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          qualified_at?: string | null
          referee_id: string
          referrer_id: string
          status?: string
        }
        Update: {
          created_at?: string
          id?: string
          qualified_at?: string | null
          referee_id?: string
          referrer_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "referrals_referee_id_fkey"
            columns: ["referee_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          comment: string | null
          contract_id: string
          created_at: string
          id: string
          rating: number
          reviewee_id: string
          reviewer_id: string
        }
        Insert: {
          comment?: string | null
          contract_id: string
          created_at?: string
          id?: string
          rating: number
          reviewee_id: string
          reviewer_id: string
        }
        Update: {
          comment?: string | null
          contract_id?: string
          created_at?: string
          id?: string
          rating?: number
          reviewee_id?: string
          reviewer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reviewee_id_fkey"
            columns: ["reviewee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      rewards: {
        Row: {
          amount: number
          claim_date: string
          created_at: string
          id: string
          kind: string
          streak: number
          user_id: string
          xp: number
        }
        Insert: {
          amount?: number
          claim_date?: string
          created_at?: string
          id?: string
          kind: string
          streak?: number
          user_id: string
          xp?: number
        }
        Update: {
          amount?: number
          claim_date?: string
          created_at?: string
          id?: string
          kind?: string
          streak?: number
          user_id?: string
          xp?: number
        }
        Relationships: [
          {
            foreignKeyName: "rewards_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      spin_wheel_segments: {
        Row: {
          active: boolean
          amount: number
          id: string
          label: string
          probability: number
        }
        Insert: {
          active?: boolean
          amount?: number
          id?: string
          label: string
          probability?: number
        }
        Update: {
          active?: boolean
          amount?: number
          id?: string
          label?: string
          probability?: number
        }
        Relationships: []
      }
      survey_questions: {
        Row: {
          id: string
          kind: string
          options: Json
          position: number
          prompt: string
          required: boolean
          survey_id: string
        }
        Insert: {
          id?: string
          kind?: string
          options?: Json
          position?: number
          prompt: string
          required?: boolean
          survey_id: string
        }
        Update: {
          id?: string
          kind?: string
          options?: Json
          position?: number
          prompt?: string
          required?: boolean
          survey_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "survey_questions_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: false
            referencedRelation: "surveys"
            referencedColumns: ["id"]
          },
        ]
      }
      survey_responses: {
        Row: {
          answers: Json
          created_at: string
          duration_seconds: number | null
          id: string
          submission_id: string | null
          survey_id: string
          user_id: string
        }
        Insert: {
          answers: Json
          created_at?: string
          duration_seconds?: number | null
          id?: string
          submission_id?: string | null
          survey_id: string
          user_id: string
        }
        Update: {
          answers?: Json
          created_at?: string
          duration_seconds?: number | null
          id?: string
          submission_id?: string | null
          survey_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "survey_responses_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "task_submissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "survey_responses_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: false
            referencedRelation: "surveys"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "survey_responses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      surveys: {
        Row: {
          closes_at: string | null
          created_at: string
          id: string
          task_id: string
          title: string
        }
        Insert: {
          closes_at?: string | null
          created_at?: string
          id?: string
          task_id: string
          title: string
        }
        Update: {
          closes_at?: string | null
          created_at?: string
          id?: string
          task_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "surveys_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: true
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_submissions: {
        Row: {
          answers: Json | null
          content: string | null
          created_at: string
          flagged: boolean
          id: string
          link_url: string | null
          proof_path: string | null
          review_note: string | null
          reviewed_at: string | null
          reviewer_id: string | null
          reward: number
          started_at: string
          status: Database["public"]["Enums"]["submission_status"]
          submitted_at: string | null
          task_id: string
          transaction_id: string | null
          user_id: string
        }
        Insert: {
          answers?: Json | null
          content?: string | null
          created_at?: string
          flagged?: boolean
          id?: string
          link_url?: string | null
          proof_path?: string | null
          review_note?: string | null
          reviewed_at?: string | null
          reviewer_id?: string | null
          reward?: number
          started_at?: string
          status?: Database["public"]["Enums"]["submission_status"]
          submitted_at?: string | null
          task_id: string
          transaction_id?: string | null
          user_id: string
        }
        Update: {
          answers?: Json | null
          content?: string | null
          created_at?: string
          flagged?: boolean
          id?: string
          link_url?: string | null
          proof_path?: string | null
          review_note?: string | null
          reviewed_at?: string | null
          reviewer_id?: string | null
          reward?: number
          started_at?: string
          status?: Database["public"]["Enums"]["submission_status"]
          submitted_at?: string | null
          task_id?: string
          transaction_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_submissions_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_submissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          budget: number | null
          campaign_id: string | null
          category: string
          completions_count: number
          created_at: string
          created_by: string | null
          description: string
          eligibility: Json
          ends_at: string | null
          estimated_minutes: number
          external_url: string | null
          id: string
          instructions: string
          max_participants: number | null
          min_seconds: number
          per_user_limit: number
          requirements: string | null
          reward: number
          sponsor: string | null
          starts_at: string | null
          status: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at: string
          verification_method: Database["public"]["Enums"]["verification_method"]
        }
        Insert: {
          budget?: number | null
          campaign_id?: string | null
          category?: string
          completions_count?: number
          created_at?: string
          created_by?: string | null
          description?: string
          eligibility?: Json
          ends_at?: string | null
          estimated_minutes?: number
          external_url?: string | null
          id?: string
          instructions?: string
          max_participants?: number | null
          min_seconds?: number
          per_user_limit?: number
          requirements?: string | null
          reward: number
          sponsor?: string | null
          starts_at?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at?: string
          verification_method?: Database["public"]["Enums"]["verification_method"]
        }
        Update: {
          budget?: number | null
          campaign_id?: string | null
          category?: string
          completions_count?: number
          created_at?: string
          created_by?: string | null
          description?: string
          eligibility?: Json
          ends_at?: string | null
          estimated_minutes?: number
          external_url?: string | null
          id?: string
          instructions?: string
          max_participants?: number | null
          min_seconds?: number
          per_user_limit?: number
          requirements?: string | null
          reward?: number
          sponsor?: string | null
          starts_at?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          title?: string
          updated_at?: string
          verification_method?: Database["public"]["Enums"]["verification_method"]
        }
        Relationships: [
          {
            foreignKeyName: "tasks_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      user_badges: {
        Row: {
          awarded_at: string
          badge_id: string
          user_id: string
        }
        Insert: {
          awarded_at?: string
          badge_id: string
          user_id: string
        }
        Update: {
          awarded_at?: string
          badge_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_badges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_challenges: {
        Row: {
          challenge_id: string
          claimed_at: string
          user_id: string
        }
        Insert: {
          challenge_id: string
          claimed_at?: string
          user_id: string
        }
        Update: {
          challenge_id?: string
          claimed_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_challenges_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_challenges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      wallet_transactions: {
        Row: {
          amount: number
          created_at: string
          description: string
          id: string
          reference: string
          related_id: string | null
          source: string
          status: Database["public"]["Enums"]["txn_status"]
          type: Database["public"]["Enums"]["txn_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description: string
          id?: string
          reference?: string
          related_id?: string | null
          source: string
          status?: Database["public"]["Enums"]["txn_status"]
          type: Database["public"]["Enums"]["txn_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string
          id?: string
          reference?: string
          related_id?: string | null
          source?: string
          status?: Database["public"]["Enums"]["txn_status"]
          type?: Database["public"]["Enums"]["txn_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallet_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      wallets: {
        Row: {
          available: number
          lifetime_earned: number
          pending: number
          total_withdrawn: number
          updated_at: string
          user_id: string
        }
        Insert: {
          available?: number
          lifetime_earned?: number
          pending?: number
          total_withdrawn?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          available?: number
          lifetime_earned?: number
          pending?: number
          total_withdrawn?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      withdrawal_requests: {
        Row: {
          amount: number
          created_at: string
          destination: string
          fee: number
          id: string
          method: string
          payout_reference: string | null
          provider_response: Json | null
          review_note: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["withdrawal_status"]
          transaction_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          destination: string
          fee?: number
          id?: string
          method: string
          payout_reference?: string | null
          provider_response?: Json | null
          review_note?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["withdrawal_status"]
          transaction_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          destination?: string
          fee?: number
          id?: string
          method?: string
          payout_reference?: string | null
          provider_response?: Json | null
          review_note?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["withdrawal_status"]
          transaction_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "withdrawal_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      _approve_submission: {
        Args: { _note: string; _sub: string }
        Returns: undefined
      }
      _award_badge: {
        Args: { _code: string; _user: string }
        Returns: undefined
      }
      _log_admin: {
        Args: { _action: string; _details?: Json; _id: string; _type: string }
        Returns: undefined
      }
      _notify: {
        Args: {
          _body: string
          _kind: string
          _link?: string
          _title: string
          _user: string
        }
        Returns: undefined
      }
      _refund_withdrawal: {
        Args: {
          _id: string
          _note: string
          _status: Database["public"]["Enums"]["withdrawal_status"]
        }
        Returns: undefined
      }
      _reject_submission: {
        Args: { _note: string; _sub: string }
        Returns: undefined
      }
      _require_active: { Args: never; Returns: undefined }
      _require_admin: { Args: never; Returns: undefined }
      admin_adjust_wallet: {
        Args: { _amount: number; _note: string; _user: string }
        Returns: undefined
      }
      admin_fund_campaign: {
        Args: { _amount: number; _id: string; _reference: string }
        Returns: undefined
      }
      admin_set_campaign_status: {
        Args: { _id: string; _status: string }
        Returns: undefined
      }
      admin_set_product_status: {
        Args: { _id: string; _status: string }
        Returns: undefined
      }
      admin_set_role: {
        Args: {
          _grant: boolean
          _role: Database["public"]["Enums"]["app_role"]
          _user: string
        }
        Returns: undefined
      }
      admin_set_user_status: {
        Args: { _status: string; _user: string }
        Returns: undefined
      }
      admin_stats: { Args: never; Returns: Json }
      admin_update_setting: {
        Args: { _key: string; _value: Json }
        Returns: undefined
      }
      cancel_my_withdrawal: { Args: { _id: string }; Returns: undefined }
      challenge_progress: {
        Args: { _metric: string; _user: string }
        Returns: number
      }
      claim_challenge: { Args: { _challenge_id: string }; Returns: undefined }
      confirm_withdrawal_paid: {
        Args: {
          _id: string
          _payout_reference: string
          _provider_response?: Json
        }
        Returns: undefined
      }
      daily_checkin: { Args: never; Returns: Json }
      enable_capability: {
        Args: { _role: Database["public"]["Enums"]["app_role"] }
        Returns: undefined
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      hire_applicant: { Args: { _application_id: string }; Returns: string }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      mark_withdrawal_failed: {
        Args: { _id: string; _provider_response?: Json }
        Returns: undefined
      }
      my_referral_network: {
        Args: { _max_depth?: number }
        Returns: {
          depth: number
          members: number
          qualified: number
        }[]
      }
      record_link_click: { Args: { _link_id: string }; Returns: string }
      referral_upline: {
        Args: { _max_depth?: number; _user: string }
        Returns: {
          depth: number
          user_id: string
        }[]
      }
      request_withdrawal: {
        Args: { _amount: number; _destination: string; _method: string }
        Returns: string
      }
      review_link_submission: {
        Args: { _approve: boolean; _id: string; _note?: string }
        Returns: undefined
      }
      review_submission: {
        Args: { _approve: boolean; _note?: string; _submission_id: string }
        Returns: undefined
      }
      review_withdrawal: {
        Args: { _action: string; _id: string; _note?: string }
        Returns: undefined
      }
      setting_num: { Args: { _key: string }; Returns: number }
      start_task: { Args: { _task_id: string }; Returns: string }
      submit_link_completion: {
        Args: { _link_id: string; _proof_text?: string; _proof_url?: string }
        Returns: string
      }
      submit_task: {
        Args: {
          _answers?: Json
          _content?: string
          _link?: string
          _proof_path?: string
          _submission_id: string
        }
        Returns: Database["public"]["Enums"]["submission_status"]
      }
      user_level_index: { Args: { _xp: number }; Returns: number }
    }
    Enums: {
      app_role: "user" | "freelancer" | "advertiser" | "admin" | "super_admin"
      submission_status:
        | "started"
        | "submitted"
        | "under_review"
        | "approved"
        | "rejected"
        | "rewarded"
      task_status:
        | "draft"
        | "published"
        | "active"
        | "paused"
        | "completed"
        | "expired"
        | "rejected"
      txn_status: "pending" | "completed" | "reversed" | "failed"
      txn_type:
        | "TASK_REWARD"
        | "SURVEY_REWARD"
        | "CAMPAIGN_REWARD"
        | "REFERRAL_REWARD"
        | "BONUS"
        | "FREELANCE_PAYMENT"
        | "MARKETPLACE_EARNING"
        | "WITHDRAWAL"
        | "REFUND"
        | "ADJUSTMENT"
      verification_method:
        | "automatic"
        | "upload_proof"
        | "text"
        | "link"
        | "survey"
        | "api"
        | "manual"
      withdrawal_status:
        | "requested"
        | "pending_review"
        | "approved"
        | "processing"
        | "paid"
        | "rejected"
        | "cancelled"
        | "failed"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["user", "freelancer", "advertiser", "admin", "super_admin"],
      submission_status: [
        "started",
        "submitted",
        "under_review",
        "approved",
        "rejected",
        "rewarded",
      ],
      task_status: [
        "draft",
        "published",
        "active",
        "paused",
        "completed",
        "expired",
        "rejected",
      ],
      txn_status: ["pending", "completed", "reversed", "failed"],
      txn_type: [
        "TASK_REWARD",
        "SURVEY_REWARD",
        "CAMPAIGN_REWARD",
        "REFERRAL_REWARD",
        "BONUS",
        "FREELANCE_PAYMENT",
        "MARKETPLACE_EARNING",
        "WITHDRAWAL",
        "REFUND",
        "ADJUSTMENT",
      ],
      verification_method: [
        "automatic",
        "upload_proof",
        "text",
        "link",
        "survey",
        "api",
        "manual",
      ],
      withdrawal_status: [
        "requested",
        "pending_review",
        "approved",
        "processing",
        "paid",
        "rejected",
        "cancelled",
        "failed",
      ],
    },
  },
} as const
