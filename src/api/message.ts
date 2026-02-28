import service from '@/utils/axios.ts'

export const test_send_message = (data = {}) =>{
  return service.post('/message_center/test_send_message',data)
}

export const save_message_channel = (data = {}) =>{
  return service.post('/message_center/save_message_channel',data)
}

export const get_message_channel = () =>{
  return service.get('/message_center/get_message_channel')
}

export const setting_message_status = (data = {}) =>{
  return service.post('/message_center/setting_message_status', data)
}

export const del_message_channel = (data = {}) =>{
  return service.post('/message_center/del_message_channel', data)
}
