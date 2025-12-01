import service from '@/utils/axios.ts'

export const login = (username: string, password: string) => {
  return service.post('/auth/login',{
      username,
      password
    })
}

export const root = () => {
  return service.get('/dashboard/dashboard',)
}

export const user_menu_info = () =>{
  return service.get('/dashboard/get_user_menu',)
}

