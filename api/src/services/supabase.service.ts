import { supabase } from '../config/supabase'

class SupabaseService {
  async createUser(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    })

    if (error) throw error
    return data
  }

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) throw error
    return data
  }

  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    return user
  }

  async updateUserProfile(userId: string, updates: any) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()

    if (error) throw error
    return data
  }

  async getUserProjects(userId: string) {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        services(count)
      `)
      .eq('user_id', userId)

    if (error) throw error
    return data
  }

  async getProjectWithServices(projectId: string, userId: string) {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        services(*)
      `)
      .eq('id', projectId)
      .eq('user_id', userId)
      .single()

    if (error) throw error
    return data
  }
}

export const supabaseService = new SupabaseService()
