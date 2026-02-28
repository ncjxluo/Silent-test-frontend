import { test_send_message, save_message_channel, get_message_channel, setting_message_status, del_message_channel } from '@/api/message.ts'


export const message_channel = () => {

  const test_send = async (data: any) => {
    const res = await test_send_message(data)
    return res.data.data
  }

  const save_message = async (data: any) => {
    const res = await save_message_channel(data)
    return res.data.data
  }

  const get_messages = async () => {
    const res = await get_message_channel()
    return res.data.data
  }

  const set_message_status = async (data: any) => {
    const res = await setting_message_status(data)
    return res.data.data
  }

  const del_message = async (data: any) => {
    const res = await del_message_channel(data)
    return res.data.data
  }

  return { test_send, save_message, get_messages, set_message_status, del_message }
}
