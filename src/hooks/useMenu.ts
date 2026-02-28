
import type { MenuItem } from '@/types/menu_type.ts'
import { user_menu_info } from '@/api/manager.ts'

export const useMenu = () => {

  // const menuTree = ref<MenuItem[]>([])

  const buildTree = (list: MenuItem[]): MenuItem[] => {
    const map = new Map<string, MenuItem>()
    const tree: MenuItem[] = []

    list.forEach(item => map.set(item.menu_key, { ...item, children: [] }))

    list.forEach(item => {
      const node = map.get(item.menu_key)!
      if (item.menu_parent_key === '0') {
        tree.push(node)
      } else {
        const parent = map.get(item.menu_parent_key)
        parent?.children?.push(node)
      }
    })

    const sortTree = (nodes: MenuItem[]) => {
      nodes.sort((a, b) => a.menu_order - b.menu_order)
      nodes.forEach(n => n.children && sortTree(n.children))
    }

    sortTree(tree)
    return tree
  }

  const filterTree = (tree: MenuItem[], visible:number=0): MenuItem[] => {
    return tree
      .filter(item => item.is_visible !== visible)
      .map(item => ({
        ...item,
        children: item.children ? filterTree(item.children, visible) : []
      }))
  }

  const fetchMenu = async () => {
    const res = await user_menu_info()
    // menuTree.value = buildTree(res.data.data)
    return res.data.data
  }

  return { buildTree, filterTree, fetchMenu }
}
