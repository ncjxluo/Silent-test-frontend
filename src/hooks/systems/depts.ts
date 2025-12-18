import {
  depts_info,
  addition_dept,
  del_dept,
  change_dept
} from '@/api/depts.ts'


export const system_dept = () => {

  const fetchDept = async (query: any) => {
    const res = await depts_info(query)
    return res.data.data
  }

  const additionDept = async (data: any) => {
    const res = await addition_dept (data)
    return res.data.data
  }

  const delDept = async (data: any) => {
    const res = await del_dept (data)
    return res.data.data
  }

  const changeDept = async (data: any) => {
    const res = await change_dept (data)
    return res.data.data
  }

  return { fetchDept, additionDept, delDept, changeDept }
}
