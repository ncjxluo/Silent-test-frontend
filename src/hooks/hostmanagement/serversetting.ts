import { add_server_group, get_server_group, del_server_group, add_virtual_machine, get_virtual_machine, verify_virtual_machine, get_virtual_machine_search,del_virtual_machine,edit_virtual_machine } from '@/api/serversetting.ts'


export const serversetting = () => {

  const addServerGroup = async (data: any) => {
    const res = await add_server_group(data)
    return res.data.data
  }

  const getServerGroup = async () => {
    const res = await get_server_group()
    return res.data.data
  }

  const delServerGroup = async (data: any) => {
    const res = await del_server_group(data)
    return res.data.data
  }

  const addVirtualMachine = async (data: any) => {
    const res = await add_virtual_machine(data)
    return res.data.data
  }

  const getVirtualMachine = async (query: any) => {
    const res = await get_virtual_machine(query)
    return res.data.data
  }

  const verifyVirtualMachine = async (data: any) => {
    const res = await verify_virtual_machine(data)
    return res.data.data
  }

  const getVirtualMachineAllSearch = async (query: any) => {
    const res = await get_virtual_machine_search(query)
    return res.data.data
  }

  const delVirtualMachine = async (data: any) => {
    const res = await del_virtual_machine(data)
    return res.data.data
  }

  const editVirtualMachine = async (data: any) => {
    const res = await edit_virtual_machine(data)
    return res.data.data
  }

  return { addServerGroup, getServerGroup, delServerGroup, addVirtualMachine, getVirtualMachine, verifyVirtualMachine, getVirtualMachineAllSearch,delVirtualMachine,editVirtualMachine }
}
