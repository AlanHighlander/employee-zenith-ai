import { supabase } from './supabase'

export async function listarLojas() {
  const { data, error } = await supabase
    .from('stores')
    .select('id, company_id, code, name, active')
    .eq('active', true)
    .order('name')

  if (error) {
    throw new Error(error.message)
  }

  return data
}
