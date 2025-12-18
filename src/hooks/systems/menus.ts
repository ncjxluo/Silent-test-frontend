import {
  menus_info
} from '@/api/menus.ts'


export const system_menu = () => {

  const fetchMenu = async () => {
    const res = await menus_info()
    return res.data.data
  }

  return { fetchMenu }
}

