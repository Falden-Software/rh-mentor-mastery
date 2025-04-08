export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      animal_profile_answers: {
        Row: {
          animal_chosen: string
          created_at: string
          id: string
          question_id: string
          result_id: string
        }
        Insert: {
          animal_chosen: string
          created_at?: string
          id?: string
          question_id: string
          result_id: string
        }
        Update: {
          animal_chosen?: string
          created_at?: string
          id?: string
          question_id?: string
          result_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "animal_profile_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "animal_profile_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "animal_profile_answers_result_id_fkey"
            columns: ["result_id"]
            isOneToOne: false
            referencedRelation: "animal_profile_results"
            referencedColumns: ["id"]
          },
        ]
      }
      animal_profile_questions: {
        Row: {
          animal_aguia: string
          animal_gato: string
          animal_lobo: string
          animal_tubarao: string
          created_at: string
          id: string
          pergunta: string
          updated_at: string
        }
        Insert: {
          animal_aguia: string
          animal_gato: string
          animal_lobo: string
          animal_tubarao: string
          created_at?: string
          id?: string
          pergunta: string
          updated_at?: string
        }
        Update: {
          animal_aguia?: string
          animal_gato?: string
          animal_lobo?: string
          animal_tubarao?: string
          created_at?: string
          id?: string
          pergunta?: string
          updated_at?: string
        }
        Relationships: []
      }
      animal_profile_results: {
        Row: {
          animal_predominante: string | null
          completed_at: string
          created_at: string
          id: string
          score_aguia: number
          score_gato: number
          score_lobo: number
          score_tubarao: number
          updated_at: string
          user_id: string
        }
        Insert: {
          animal_predominante?: string | null
          completed_at?: string
          created_at?: string
          id?: string
          score_aguia?: number
          score_gato?: number
          score_lobo?: number
          score_tubarao?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          animal_predominante?: string | null
          completed_at?: string
          created_at?: string
          id?: string
          score_aguia?: number
          score_gato?: number
          score_lobo?: number
          score_tubarao?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      client_tests: {
        Row: {
          client_id: string
          completed_at: string | null
          created_at: string
          id: string
          is_completed: boolean
          started_at: string | null
          test_id: string
          updated_at: string
        }
        Insert: {
          client_id: string
          completed_at?: string | null
          created_at?: string
          id?: string
          is_completed?: boolean
          started_at?: string | null
          test_id: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          completed_at?: string | null
          created_at?: string
          id?: string
          is_completed?: boolean
          started_at?: string | null
          test_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_tests_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_tests_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "tests"
            referencedColumns: ["id"]
          },
        ]
      }
      invitation_codes: {
        Row: {
          code: string
          created_at: string
          email: string
          expires_at: string
          id: string
          is_used: boolean
          mentor_id: string
          used_by: string | null
        }
        Insert: {
          code: string
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          is_used?: boolean
          mentor_id: string
          used_by?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          is_used?: boolean
          mentor_id?: string
          used_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invitation_codes_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invitation_codes_used_by_fkey"
            columns: ["used_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          bio: string | null
          company: string | null
          created_at: string
          id: string
          mentor_id: string | null
          name: string
          phone: string | null
          position: string | null
          role: string
          updated_at: string
        }
        Insert: {
          bio?: string | null
          company?: string | null
          created_at?: string
          id: string
          mentor_id?: string | null
          name: string
          phone?: string | null
          position?: string | null
          role: string
          updated_at?: string
        }
        Update: {
          bio?: string | null
          company?: string | null
          created_at?: string
          id?: string
          mentor_id?: string | null
          name?: string
          phone?: string | null
          position?: string | null
          role?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      test_results: {
        Row: {
          client_test_id: string
          created_at: string
          data: Json
          id: string
          updated_at: string
        }
        Insert: {
          client_test_id: string
          created_at?: string
          data: Json
          id?: string
          updated_at?: string
        }
        Update: {
          client_test_id?: string
          created_at?: string
          data?: Json
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "test_results_client_test_id_fkey"
            columns: ["client_test_id"]
            isOneToOne: false
            referencedRelation: "client_tests"
            referencedColumns: ["id"]
          },
        ]
      }
      tests: {
        Row: {
          created_at: string
          description: string | null
          id: string
          mentor_id: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          mentor_id: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          mentor_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tests_mentor_id_fkey"
            columns: ["mentor_id"]
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
      client_can_access_test: {
        Args: { client_id: string; test_id: string }
        Returns: boolean
      }
      get_client_tests_for_user: {
        Args: { user_id: string }
        Returns: {
          client_id: string
          completed_at: string | null
          created_at: string
          id: string
          is_completed: boolean
          started_at: string | null
          test_id: string
          updated_at: string
        }[]
      }
      get_profile_by_id: {
        Args: { user_id: string }
        Returns: {
          bio: string | null
          company: string | null
          created_at: string
          id: string
          mentor_id: string | null
          name: string
          phone: string | null
          position: string | null
          role: string
          updated_at: string
        }[]
      }
      get_test_info: {
        Args: { test_id: string }
        Returns: {
          created_at: string
          description: string | null
          id: string
          mentor_id: string
          title: string
          updated_at: string
        }[]
      }
      get_test_results_for_client_test: {
        Args: { client_test_id: string }
        Returns: {
          client_test_id: string
          created_at: string
          data: Json
          id: string
          updated_at: string
        }[]
      }
      get_user_profile: {
        Args: { user_id: string }
        Returns: {
          bio: string | null
          company: string | null
          created_at: string
          id: string
          mentor_id: string | null
          name: string
          phone: string | null
          position: string | null
          role: string
          updated_at: string
        }[]
      }
      is_client_of_mentor: {
        Args: { client_id: string; mentor_id: string }
        Returns: boolean
      }
      is_user_mentor: {
        Args: { user_id: string }
        Returns: boolean
      }
      mentor_owns_test: {
        Args: { mentor_id: string; test_id: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
