export interface MenuItem {
  menu_key: string
  menu_parent_key: string
  menu_order: number
  menu_path: string
  menu_router_name: string
  menu_component?: string
  menu_icon?: string
  menu_type?: string
  menu_name: string
  is_visible?: number
  permission_code?: string
  children?: MenuItem[]
}
