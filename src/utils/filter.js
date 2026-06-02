// Модуль фильтрации точек маршрута по времени (будущие, текущие, прошедшие)

import dayjs from 'dayjs';
import {FilterType} from '../const.js';

// Проверяет, начинается ли событие в будущем
const isFuture = (dateFrom) => dayjs(dateFrom).isAfter(dayjs());

// Проверяет, происходит ли событие в текущий момент
const isPresent = (dateFrom, dateTo) => dayjs(dateFrom).isSame(dayjs()) || (dayjs(dateFrom).isBefore(dayjs()) && dayjs(dateTo).isAfter(dayjs()));

// Проверяет, закончилось ли событие в прошлом
const isPast = (dateTo) => dayjs(dateTo).isBefore(dayjs());

// Объект с методами фильтрации для каждого типа фильтра
const filter = {
  // Показывает все точки без фильтрации
  [FilterType.EVERYTHING]: (points) => points,

  // Показывает только будущие события
  [FilterType.FUTURE]: (points) => points.filter((point) => isFuture(point.dateFrom)),

  // Показывает текущие события
  [FilterType.PRESENT]: (points) => points.filter((point) => isPresent(point.dateFrom, point.dateTo)),

  // Показывает только прошедшие события
  [FilterType.PAST]: (points) => points.filter((point) => isPast(point.dateTo)),
};

export {filter};
