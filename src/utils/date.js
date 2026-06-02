// Утилиты для форматирования дат, времени и длительности событий

import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';

// Подключаем плагин для работы с длительностью
dayjs.extend(duration);

// Форматы дат
const DATE_FORMAT = 'MMM D';
const TIME_FORMAT = 'HH:mm';
const FULL_DATE_FORMAT = 'DD/MM/YY HH:mm';

// Преобразует дату в формат "MMM D" (например, "May 22")
function humanizePointDate(date) {
  return date ? dayjs(date).format(DATE_FORMAT) : '';
}

// Преобразует дату в формат времени "HH:mm"
function humanizePointTime(date) {
  return date ? dayjs(date).format(TIME_FORMAT) : '';
}

// Преобразует дату в полный формат "DD/MM/YY HH:mm"
function humanizeFullDate(date) {
  return date ? dayjs(date).format(FULL_DATE_FORMAT) : '';
}

// Вычисляет длительность между двумя датами и форматирует в "DDD HHH MMM" или "HH MMM" или "MMM"
function getPointDuration(dateFrom, dateTo) {
  const start = dayjs(dateFrom);
  const end = dayjs(dateTo);
  const diff = end.diff(start);
  const durationObj = dayjs.duration(diff);

  const days = Math.floor(durationObj.asDays());
  const hours = durationObj.hours();
  const minutes = durationObj.minutes();

  let formattedDuration = '';

  if (days > 0) {
    formattedDuration += `${String(days).padStart(2, '0')}D `;
    formattedDuration += `${String(hours).padStart(2, '0')}H `;
    formattedDuration += `${String(minutes).padStart(2, '0')}M`;
  } else if (hours > 0) {
    formattedDuration += `${String(hours).padStart(2, '0')}H `;
    formattedDuration += `${String(minutes).padStart(2, '0')}M`;
  } else {
    formattedDuration += `${String(minutes).padStart(2, '0')}M`;
  }

  return formattedDuration;
}

// Форматирует даты начала и окончания путешествия для шапки
// Если месяц одинаковый, показывает "D — D MMM", иначе "D MMM — D MMM"
function formatTripDates(dateFrom, dateTo) {
  const start = dayjs(dateFrom);
  const end = dayjs(dateTo);

  if (start.isSame(end, 'month')) {
    return `${start.format('D')}&nbsp;&mdash;&nbsp;${end.format('D MMM')}`;
  }

  return `${start.format('D MMM')}&nbsp;&mdash;&nbsp;${end.format('D MMM')}`;
}

// Экспорт всех функций
export {
  humanizePointDate,
  humanizePointTime,
  humanizeFullDate,
  getPointDuration,
  formatTripDates
};
