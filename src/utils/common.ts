import { randomInt } from 'crypto'
import fetch from 'node-fetch'

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function generateVietQRURL(
  bankCode: string,
  accountNumber: string,
  amount: number,
  accountName: string
) {
  switch (bankCode) {
    case 'PV':
      bankCode = 'PVCB'
      break
    case 'WOORI':
      bankCode = 'WVN'
      break
    case 'VIETCAPITAL':
      bankCode = 'VCCB'
      break
    default:
      break
  }
  const vietQRBaseUrl = 'https://img.vietqr.io/image/'
  const vietQRUrl =
    vietQRBaseUrl +
    bankCode +
    '-' +
    accountNumber +
    '-print.png' +
    '?amount=' +
    amount +
    '&accountName=' +
    accountName

  return vietQRUrl
}

export function fibonacci(number: number) {
  let n1 = 0
  let n2 = 1
  let nextTerm = 0
  const fibs = []
  for (let i = 1; i <= number; i++) {
    fibs.push(n1)
    nextTerm = n1 + n2
    n1 = n2
    n2 = nextTerm
  }
  return fibs
}

export function generateCode() {
  const uuid = randomInt(100000, 999999)
  return uuid.toString()
}

export function sendTelegramMessage(
  telegramToken: string,
  telegramChatId: string,
  msg: string
) {
  const url = `https://api.telegram.org/bot${telegramToken}/sendMessage?chat_id=${telegramChatId}&parse_mode=HTML&text=${msg}`
  fetch(url)
}

export async function getServerIP() {
  const res = await fetch('https://api.ipify.org/?format=json')
  const ipData = await res.json()
  return ipData.ip
}

export function removeVietnameseTones(str) {
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a')
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e')
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, 'i')
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o')
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u')
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y')
  str = str.replace(/đ/g, 'd')
  str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, 'A')
  str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, 'E')
  str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, 'I')
  str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, 'O')
  str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, 'U')
  str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, 'Y')
  str = str.replace(/Đ/g, 'D')
  str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, '')
  str = str.replace(/\u02C6|\u0306|\u031B/g, '')
  str = str.replace(
    /!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\;|\'|\"|\&|\#|\[|\]|~|\$|_|`|-|{|}|\||\\/g,
    ' '
  )
  return str
}
