import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'

dayjs.locale('zh-cn')
dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(relativeTime)

export const TZ_SHANGHAI = 'Asia/Shanghai'

export const formatDate = (date: dayjs.ConfigType, formatStr: string = 'YYYY.MM.DD'): string => {
  return dayjs(date).tz(TZ_SHANGHAI).format(formatStr)
}

export const formatTime = (date: dayjs.ConfigType, formatStr: string = 'HH:mm'): string => {
  return dayjs(date).tz(TZ_SHANGHAI).format(formatStr)
}

export const formatFull = (
  date: dayjs.ConfigType,
  formatStr: string = 'YYYY.MM.DD HH:mm',
): string => {
  return dayjs(date).tz(TZ_SHANGHAI).format(formatStr)
}

export const fromNow = (date: dayjs.ConfigType): string => {
  return dayjs(date).tz(TZ_SHANGHAI).fromNow()
}

export { dayjs }
