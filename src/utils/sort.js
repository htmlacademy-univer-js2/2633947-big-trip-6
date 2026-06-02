// Модуль сортировки точек маршрута (по дате, длительности и цене)

import dayjs from 'dayjs';

// Вспомогательная функция для обработки null дат при сортировке
function getWeightForNullDate(dateA, dateB) {
  if (dateA === null && dateB === null) {
    return 0;
  }

  if (dateA === null) {
    return 1;
  }

  if (dateB === null) {
    return -1;
  }

  return null;
}

// Сортировка по дате начала события (от старых к новым)
function sortPointDay(pointA, pointB) {
  const weight = getWeightForNullDate(pointA.dateFrom, pointB.dateFrom);
  return weight ?? dayjs(pointA.dateFrom).diff(dayjs(pointB.dateFrom));
}

// Сортировка по длительности события (от самых долгих к самым коротким)
function sortPointTime(pointA, pointB) {
  const durationA = dayjs(pointA.dateTo).diff(dayjs(pointA.dateFrom));
  const durationB = dayjs(pointB.dateTo).diff(dayjs(pointB.dateFrom));
  return durationB - durationA;
}

// Сортировка по цене (от самых дорогих к самым дешёвым)
function sortPointPrice(pointA, pointB) {
  return pointB.basePrice - pointA.basePrice;
}

export {sortPointDay, sortPointTime, sortPointPrice};
