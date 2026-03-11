const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'

interface RequestOptions {
  method?: string
  body?: any
  headers?: Record<string, string>
}

class ApiService {
  private getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token')
    }
    return null
  }

  private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const token = this.getToken()

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers,
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    console.log('API Request:', options.method || 'GET', endpoint, 'Token:', token ? 'yes' : 'no')

    const response = await fetch(`${API_URL}${endpoint}`, {
      method: options.method || 'GET',
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ erro: 'Erro desconhecido' }))
      throw new Error(error.erro || `Erro ${response.status}`)
    }

    return response.json()
  }

  // Auth
  async login(email: string, senha: string) {
    const data = await this.request<{ token: string; usuario: any }>('/api/auth/login', {
      method: 'POST',
      body: { email, senha },
    })
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', data.token)
      localStorage.setItem('usuario', JSON.stringify(data.usuario))
    }
    return data
  }

  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token')
      localStorage.removeItem('usuario')
    }
  }

  // Dashboard
  async getDashboard() {
    return this.request<any>('/api/dashboard')
  }

  // Products
  async getProdutos() {
    return this.request<any[]>('/api/produtos')
  }

  async createProduto(data: any) {
    return this.request<any>('/api/produtos', { method: 'POST', body: data })
  }

  async updateProduto(id: number, data: any) {
    return this.request<any>(`/api/produtos/${id}`, { method: 'PUT', body: data })
  }

  async deleteProduto(id: number) {
    return this.request<any>(`/api/produtos/${id}`, { method: 'DELETE' })
  }

  // Production
  async getProducoes() {
    return this.request<any[]>('/api/producoes')
  }

  async createProducao(data: any) {
    return this.request<any>('/api/producoes', { method: 'POST', body: data })
  }

  // Sales (Saídas)
  async getSaidas() {
    return this.request<any[]>('/api/saidas')
  }

  async createSaida(data: any) {
    return this.request<any>('/api/saidas', { method: 'POST', body: data })
  }

  // Destinos (Clients)
  async getDestinos() {
    return this.request<any[]>('/api/destinos')
  }

  async getCategorias() {
    return this.request<any[]>('/api/destinos/categorias')
  }

  // Reports
  async getRelatorioVendas(dataInicio?: string, dataFim?: string) {
    const params = new URLSearchParams()
    if (dataInicio) params.append('data_inicio', dataInicio)
    if (dataFim) params.append('data_fim', dataFim)
    const query = params.toString() ? `?${params.toString()}` : ''
    return this.request<any>(`/api/relatorios/vendas${query}`)
  }

  async getRelatorioProducao(dataInicio?: string, dataFim?: string) {
    const params = new URLSearchParams()
    if (dataInicio) params.append('data_inicio', dataInicio)
    if (dataFim) params.append('data_fim', dataFim)
    const query = params.toString() ? `?${params.toString()}` : ''
    return this.request<any>(`/api/relatorios/producao${query}`)
  }

  // Stock
  async getEstoque() {
    return this.request<any[]>('/api/produtos/estoque')
  }
}

export const api = new ApiService()

