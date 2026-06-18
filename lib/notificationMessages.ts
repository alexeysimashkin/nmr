export const NOTIFICATION_TYPES = {
  CHECKIN_DESKS_CHANGED: 'checkin_desks_changed',
  GATE_CHANGED: 'gate_changed',
  TIME_CHANGED: 'time_changed',
  FLIGHT_DELAYED: 'flight_delayed',
  FLIGHT_CANCELLED: 'flight_cancelled',
  HOTEL_PROVIDED: 'hotel_provided',
  CHECKIN_OPENED: 'checkin_opened',
  CHECKIN_CLOSED: 'checkin_closed',
  BOARDING_STARTED: 'boarding_started',
  BOARDING_CLOSED: 'boarding_closed',
  FLIGHT_DEPARTED: 'flight_departed',
  FLIGHT_DIVERTED: 'flight_diverted',
  FLIGHT_DISTRESS: 'flight_distress',
} as const

export function getNotificationMessage(type: string, details?: any): string {
  switch (type) {
    case NOTIFICATION_TYPES.CHECKIN_DESKS_CHANGED:
      return `Изменены стойки регистрации: ${details?.desks || ''}`
    case NOTIFICATION_TYPES.GATE_CHANGED:
      return `Изменён выход на посадку: ${details?.gate || ''} (${details?.boardingType || ''})`
    case NOTIFICATION_TYPES.TIME_CHANGED:
      return `Изменено время вылета/прилёта`
    case NOTIFICATION_TYPES.FLIGHT_DELAYED:
      return `Рейс задержан до ${details?.delayedUntil ? new Date(details.delayedUntil).toLocaleString('ru-RU') : ''}`
    case NOTIFICATION_TYPES.FLIGHT_CANCELLED:
      return `Рейс отменён`
    case NOTIFICATION_TYPES.HOTEL_PROVIDED:
      return `Предоставлен отель: ${details?.hotelAddress || ''}, номер: ${details?.hotelRoom || ''}`
    case NOTIFICATION_TYPES.CHECKIN_OPENED:
      return `Регистрация открыта. Стойки: ${details?.desks || ''}`
    case NOTIFICATION_TYPES.CHECKIN_CLOSED:
      return `Регистрация закончена`
    case NOTIFICATION_TYPES.BOARDING_STARTED:
      return `Посадка началась. Выход: ${details?.gate || ''}`
    case NOTIFICATION_TYPES.BOARDING_CLOSED:
      return `Посадка закончена`
    case NOTIFICATION_TYPES.FLIGHT_DEPARTED:
      return `Рейс вылетел в ${details?.actualDeparture ? new Date(details.actualDeparture).toLocaleTimeString('ru-RU') : ''}`
    case NOTIFICATION_TYPES.FLIGHT_DIVERTED:
      return `Самолёт перенаправлен в аэропорт ${details?.city || ''} (${details?.code || ''})`
    case NOTIFICATION_TYPES.FLIGHT_DISTRESS:
      return `⚠️ САМОЛЁТ ПОДАЛ СИГНАЛ БЕДСТВИЯ! Код: ${details?.distressCode || ''}`
    default:
      return 'Обновление информации о рейсе'
  }
}
