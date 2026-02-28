import { get_notice, get_memo, add_memo, edit_memo, del_memo } from '@/api/dashboard.ts'


export const str_dashboard = () => {

  const getNotice = async () => {
    const res = await get_notice()
    return res.data.data
  }

  const getMemo = async (query: any) => {
    const res = await get_memo(query)
    return res.data.data
  }

  const addMemo = async (data: any) => {
    const res = await add_memo(data)
    return res.data.data
  }

  const editMemo = async (data: any) => {
    const res = await edit_memo(data)
    return res.data.data
  }

  const delMemo = async (data: any) => {
    const res = await del_memo(data)
    return res.data.data
  }

  return { getNotice, getMemo, addMemo, editMemo, delMemo }
}
