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
      alerts: {
        Row: {
          action: string | null
          checkin_id: string | null
          created_at: string
          id: string
          medication_id: string | null
          reason: string
          rehab_id: string
          resolved_at: string | null
          resolved_by: string | null
          source: Database["public"]["Enums"]["alert_source"]
          state: Database["public"]["Enums"]["alert_state"]
          status: Database["public"]["Enums"]["triage_status"]
        }
        Insert: {
          action?: string | null
          checkin_id?: string | null
          created_at?: string
          id?: string
          medication_id?: string | null
          reason: string
          rehab_id: string
          resolved_at?: string | null
          resolved_by?: string | null
          source?: Database["public"]["Enums"]["alert_source"]
          state?: Database["public"]["Enums"]["alert_state"]
          status: Database["public"]["Enums"]["triage_status"]
        }
        Update: {
          action?: string | null
          checkin_id?: string | null
          created_at?: string
          id?: string
          medication_id?: string | null
          reason?: string
          rehab_id?: string
          resolved_at?: string | null
          resolved_by?: string | null
          source?: Database["public"]["Enums"]["alert_source"]
          state?: Database["public"]["Enums"]["alert_state"]
          status?: Database["public"]["Enums"]["triage_status"]
        }
        Relationships: [
          {
            foreignKeyName: "alerts_checkin_id_fkey"
            columns: ["checkin_id"]
            isOneToOne: false
            referencedRelation: "checkins"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alerts_medication_id_fkey"
            columns: ["medication_id"]
            isOneToOne: false
            referencedRelation: "medications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alerts_rehab_id_fkey"
            columns: ["rehab_id"]
            isOneToOne: false
            referencedRelation: "rehabilitacije"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alerts_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alerts_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "staff_directory"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: {
        Row: {
          appt_date: string
          appt_time: string
          created_at: string
          created_by: string | null
          doctor: string | null
          id: string
          note: string | null
          place: string
          rehab_id: string
          status: string
          updated_at: string
        }
        Insert: {
          appt_date: string
          appt_time: string
          created_at?: string
          created_by?: string | null
          doctor?: string | null
          id?: string
          note?: string | null
          place: string
          rehab_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          appt_date?: string
          appt_time?: string
          created_at?: string
          created_by?: string | null
          doctor?: string | null
          id?: string
          note?: string | null
          place?: string
          rehab_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "staff_directory"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_rehab_id_fkey"
            columns: ["rehab_id"]
            isOneToOne: false
            referencedRelation: "rehabilitacije"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          details: Json
          entity: string
          entity_id: string | null
          id: number
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          details?: Json
          entity: string
          entity_id?: string | null
          id?: never
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          details?: Json
          entity?: string
          entity_id?: string | null
          id?: never
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_log_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "staff_directory"
            referencedColumns: ["id"]
          },
        ]
      }
      checkins: {
        Row: {
          answers: Json
          checkin_date: string
          created_at: string
          entered_by: string
          id: string
          photo_path: string | null
          photo_path_2: string | null
          reasons: string[]
          rehab_id: string
          same_as_yesterday: boolean
          triage_status: Database["public"]["Enums"]["triage_status"]
        }
        Insert: {
          answers?: Json
          checkin_date?: string
          created_at?: string
          entered_by?: string
          id?: string
          photo_path?: string | null
          photo_path_2?: string | null
          reasons?: string[]
          rehab_id: string
          same_as_yesterday?: boolean
          triage_status?: Database["public"]["Enums"]["triage_status"]
        }
        Update: {
          answers?: Json
          checkin_date?: string
          created_at?: string
          entered_by?: string
          id?: string
          photo_path?: string | null
          photo_path_2?: string | null
          reasons?: string[]
          rehab_id?: string
          same_as_yesterday?: boolean
          triage_status?: Database["public"]["Enums"]["triage_status"]
        }
        Relationships: [
          {
            foreignKeyName: "checkins_entered_by_fkey"
            columns: ["entered_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checkins_entered_by_fkey"
            columns: ["entered_by"]
            isOneToOne: false
            referencedRelation: "staff_directory"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checkins_rehab_id_fkey"
            columns: ["rehab_id"]
            isOneToOne: false
            referencedRelation: "rehabilitacije"
            referencedColumns: ["id"]
          },
        ]
      }
      dose_logs: {
        Row: {
          created_at: string
          entered_by: string
          id: string
          medication_id: string
          rehab_id: string
          scheduled_date: string
          status: Database["public"]["Enums"]["dose_status"]
          time_of_day: Database["public"]["Enums"]["time_of_day"]
        }
        Insert: {
          created_at?: string
          entered_by?: string
          id?: string
          medication_id: string
          rehab_id: string
          scheduled_date?: string
          status: Database["public"]["Enums"]["dose_status"]
          time_of_day: Database["public"]["Enums"]["time_of_day"]
        }
        Update: {
          created_at?: string
          entered_by?: string
          id?: string
          medication_id?: string
          rehab_id?: string
          scheduled_date?: string
          status?: Database["public"]["Enums"]["dose_status"]
          time_of_day?: Database["public"]["Enums"]["time_of_day"]
        }
        Relationships: [
          {
            foreignKeyName: "dose_logs_entered_by_fkey"
            columns: ["entered_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dose_logs_entered_by_fkey"
            columns: ["entered_by"]
            isOneToOne: false
            referencedRelation: "staff_directory"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dose_logs_medication_id_fkey"
            columns: ["medication_id"]
            isOneToOne: false
            referencedRelation: "medications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dose_logs_rehab_id_fkey"
            columns: ["rehab_id"]
            isOneToOne: false
            referencedRelation: "rehabilitacije"
            referencedColumns: ["id"]
          },
        ]
      }
      family_access: {
        Row: {
          created_at: string
          decided_at: string | null
          id: string
          patient_id: string
          relation: string | null
          requester_id: string
          status: Database["public"]["Enums"]["access_status"]
        }
        Insert: {
          created_at?: string
          decided_at?: string | null
          id?: string
          patient_id: string
          relation?: string | null
          requester_id: string
          status?: Database["public"]["Enums"]["access_status"]
        }
        Update: {
          created_at?: string
          decided_at?: string | null
          id?: string
          patient_id?: string
          relation?: string | null
          requester_id?: string
          status?: Database["public"]["Enums"]["access_status"]
        }
        Relationships: [
          {
            foreignKeyName: "family_access_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "family_access_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "staff_directory"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "family_access_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "family_access_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "staff_directory"
            referencedColumns: ["id"]
          },
        ]
      }
      medications: {
        Row: {
          active_substance: string | null
          change: Database["public"]["Enums"]["medication_change"]
          created_at: string
          dose: string
          end_date: string | null
          id: string
          name: string
          photo_url: string | null
          picked_up_at: string | null
          pickup_pack_size: number | null
          previous_dose: string | null
          purpose: string | null
          rehab_id: string
          start_date: string
          times: Database["public"]["Enums"]["time_of_day"][]
        }
        Insert: {
          active_substance?: string | null
          change?: Database["public"]["Enums"]["medication_change"]
          created_at?: string
          dose: string
          end_date?: string | null
          id?: string
          name: string
          photo_url?: string | null
          picked_up_at?: string | null
          pickup_pack_size?: number | null
          previous_dose?: string | null
          purpose?: string | null
          rehab_id: string
          start_date?: string
          times?: Database["public"]["Enums"]["time_of_day"][]
        }
        Update: {
          active_substance?: string | null
          change?: Database["public"]["Enums"]["medication_change"]
          created_at?: string
          dose?: string
          end_date?: string | null
          id?: string
          name?: string
          photo_url?: string | null
          picked_up_at?: string | null
          pickup_pack_size?: number | null
          previous_dose?: string | null
          purpose?: string | null
          rehab_id?: string
          start_date?: string
          times?: Database["public"]["Enums"]["time_of_day"][]
        }
        Relationships: [
          {
            foreignKeyName: "medications_rehab_id_fkey"
            columns: ["rehab_id"]
            isOneToOne: false
            referencedRelation: "rehabilitacije"
            referencedColumns: ["id"]
          },
        ]
      }
      nadomescanje: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          nurse_id: string
          substitute_id: string
          until_date: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          nurse_id: string
          substitute_id: string
          until_date: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          nurse_id?: string
          substitute_id?: string
          until_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "nadomescanje_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nadomescanje_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "staff_directory"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nadomescanje_nurse_id_fkey"
            columns: ["nurse_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nadomescanje_nurse_id_fkey"
            columns: ["nurse_id"]
            isOneToOne: false
            referencedRelation: "staff_directory"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nadomescanje_substitute_id_fkey"
            columns: ["substitute_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nadomescanje_substitute_id_fkey"
            columns: ["substitute_id"]
            isOneToOne: false
            referencedRelation: "staff_directory"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_qr_tokens: {
        Row: {
          created_at: string
          patient_id: string
          token: string
        }
        Insert: {
          created_at?: string
          patient_id: string
          token: string
        }
        Update: {
          created_at?: string
          patient_id?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "patient_qr_tokens_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_qr_tokens_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: true
            referencedRelation: "staff_directory"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          checkin_time: string
          created_at: string
          davcna: string
          first_name: string
          id: string
          is_staff: boolean
          last_name: string
          naselje: string | null
          obcina: string | null
          phone: string | null
          photo_url: string | null
        }
        Insert: {
          address?: string | null
          checkin_time?: string
          created_at?: string
          davcna: string
          first_name?: string
          id: string
          is_staff?: boolean
          last_name?: string
          naselje?: string | null
          obcina?: string | null
          phone?: string | null
          photo_url?: string | null
        }
        Update: {
          address?: string | null
          checkin_time?: string
          created_at?: string
          davcna?: string
          first_name?: string
          id?: string
          is_staff?: boolean
          last_name?: string
          naselje?: string | null
          obcina?: string | null
          phone?: string | null
          photo_url?: string | null
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          id: string
          p256dh: string
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          p256dh: string
          user_id?: string
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          p256dh?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "push_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "push_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "staff_directory"
            referencedColumns: ["id"]
          },
        ]
      }
      rehab_exercises: {
        Row: {
          active: boolean
          created_at: string
          exercise_id: string
          id: string
          rehab_id: string
          repetitions: string | null
          times_per_day: number
          title: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          exercise_id: string
          id?: string
          rehab_id: string
          repetitions?: string | null
          times_per_day?: number
          title: string
        }
        Update: {
          active?: boolean
          created_at?: string
          exercise_id?: string
          id?: string
          rehab_id?: string
          repetitions?: string | null
          times_per_day?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "rehab_exercises_rehab_id_fkey"
            columns: ["rehab_id"]
            isOneToOne: false
            referencedRelation: "rehabilitacije"
            referencedColumns: ["id"]
          },
        ]
      }
      rehab_logs: {
        Row: {
          created_at: string
          done: boolean
          entered_by: string
          id: string
          log_date: string
          pain: number | null
          rehab_exercise_id: string
          rehab_id: string
        }
        Insert: {
          created_at?: string
          done: boolean
          entered_by?: string
          id?: string
          log_date?: string
          pain?: number | null
          rehab_exercise_id: string
          rehab_id: string
        }
        Update: {
          created_at?: string
          done?: boolean
          entered_by?: string
          id?: string
          log_date?: string
          pain?: number | null
          rehab_exercise_id?: string
          rehab_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rehab_logs_entered_by_fkey"
            columns: ["entered_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rehab_logs_entered_by_fkey"
            columns: ["entered_by"]
            isOneToOne: false
            referencedRelation: "staff_directory"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rehab_logs_rehab_exercise_id_fkey"
            columns: ["rehab_exercise_id"]
            isOneToOne: false
            referencedRelation: "rehab_exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rehab_logs_rehab_id_fkey"
            columns: ["rehab_id"]
            isOneToOne: false
            referencedRelation: "rehabilitacije"
            referencedColumns: ["id"]
          },
        ]
      }
      rehabilitacije: {
        Row: {
          assigned_nurse_id: string | null
          created_at: string
          created_by: string | null
          current_status: Database["public"]["Enums"]["triage_status"]
          diagnosis: string | null
          end_date: string
          id: string
          installed_at: string | null
          lace: Json | null
          patient_id: string
          patient_values: Json
          questions: string[]
          start_date: string
          status: Database["public"]["Enums"]["rehab_status"]
          template_id: string
          updated_at: string
        }
        Insert: {
          assigned_nurse_id?: string | null
          created_at?: string
          created_by?: string | null
          current_status?: Database["public"]["Enums"]["triage_status"]
          diagnosis?: string | null
          end_date: string
          id?: string
          installed_at?: string | null
          lace?: Json | null
          patient_id: string
          patient_values?: Json
          questions?: string[]
          start_date?: string
          status?: Database["public"]["Enums"]["rehab_status"]
          template_id: string
          updated_at?: string
        }
        Update: {
          assigned_nurse_id?: string | null
          created_at?: string
          created_by?: string | null
          current_status?: Database["public"]["Enums"]["triage_status"]
          diagnosis?: string | null
          end_date?: string
          id?: string
          installed_at?: string | null
          lace?: Json | null
          patient_id?: string
          patient_values?: Json
          questions?: string[]
          start_date?: string
          status?: Database["public"]["Enums"]["rehab_status"]
          template_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rehabilitacije_assigned_nurse_id_fkey"
            columns: ["assigned_nurse_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rehabilitacije_assigned_nurse_id_fkey"
            columns: ["assigned_nurse_id"]
            isOneToOne: false
            referencedRelation: "staff_directory"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rehabilitacije_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rehabilitacije_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "staff_directory"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rehabilitacije_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rehabilitacije_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "staff_directory"
            referencedColumns: ["id"]
          },
        ]
      }
      reminders_sent: {
        Row: {
          day: string
          kind: string
          rehab_id: string
          sent_at: string
        }
        Insert: {
          day: string
          kind: string
          rehab_id: string
          sent_at?: string
        }
        Update: {
          day?: string
          kind?: string
          rehab_id?: string
          sent_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reminders_sent_rehab_id_fkey"
            columns: ["rehab_id"]
            isOneToOne: false
            referencedRelation: "rehabilitacije"
            referencedColumns: ["id"]
          },
        ]
      }
      template_overrides: {
        Row: {
          data: Json
          template_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          data?: Json
          template_id: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          data?: Json
          template_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "template_overrides_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "template_overrides_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "staff_directory"
            referencedColumns: ["id"]
          },
        ]
      }
      tereni: {
        Row: {
          id: string
          naselja: string[] | null
          nurse_id: string
          obcina: string
          postcodes: string[] | null
        }
        Insert: {
          id?: string
          naselja?: string[] | null
          nurse_id: string
          obcina: string
          postcodes?: string[] | null
        }
        Update: {
          id?: string
          naselja?: string[] | null
          nurse_id?: string
          obcina?: string
          postcodes?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "tereni_nurse_id_fkey"
            columns: ["nurse_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tereni_nurse_id_fkey"
            columns: ["nurse_id"]
            isOneToOne: false
            referencedRelation: "staff_directory"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      staff_directory: {
        Row: {
          first_name: string | null
          id: string | null
          last_name: string | null
          photo_url: string | null
        }
        Insert: {
          first_name?: string | null
          id?: string | null
          last_name?: string | null
          photo_url?: string | null
        }
        Update: {
          first_name?: string | null
          id?: string | null
          last_name?: string | null
          photo_url?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      can_log_rehab: { Args: { p_rehab: string }; Returns: boolean }
      can_read_rehab: { Args: { p_rehab: string }; Returns: boolean }
      claim_rehab: { Args: { p_rehab_id: string }; Returns: boolean }
      is_carer_of: { Args: { p_patient: string }; Returns: boolean }
      is_staff: { Args: never; Returns: boolean }
      request_family_access: {
        Args: { p_davcna: string; p_relation?: string }
        Returns: undefined
      }
      resolve_nurse_alert: {
        Args: { p_action: string; p_alert_id: string }
        Returns: boolean
      }
      revoke_user_sessions: { Args: { p_user: string }; Returns: undefined }
      today_lj: { Args: never; Returns: string }
      valid_davcna: { Args: { d: string }; Returns: boolean }
    }
    Enums: {
      access_status: "pending" | "approved" | "rejected"
      alert_source: "checkin" | "zdravila" | "brez_pregleda" | "drugo"
      alert_state: "odprto" | "zaprto"
      dose_status: "vzeto" | "izpusceno"
      medication_change: "novo" | "spremenjeno" | "nespremenjeno" | "ukinjeno"
      rehab_status: "aktivna" | "zakljucena"
      time_of_day: "zjutraj" | "opoldne" | "zvecer" | "ponoci"
      triage_status: "zeleno" | "rumeno" | "rdece"
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
      access_status: ["pending", "approved", "rejected"],
      alert_source: ["checkin", "zdravila", "brez_pregleda", "drugo"],
      alert_state: ["odprto", "zaprto"],
      dose_status: ["vzeto", "izpusceno"],
      medication_change: ["novo", "spremenjeno", "nespremenjeno", "ukinjeno"],
      rehab_status: ["aktivna", "zakljucena"],
      time_of_day: ["zjutraj", "opoldne", "zvecer", "ponoci"],
      triage_status: ["zeleno", "rumeno", "rdece"],
    },
  },
} as const
