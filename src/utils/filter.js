import dayjs from 'dayjs';
import {FilterType} from '../const.js';

const isFuture = (dateFrom) => dayjs(dateFrom).isAfter(dayjs());
const isPresent = (dateFrom, dateTo) => dayjs(dateFrom).isSame(dayjs()) || (dayjs(dateFrom).isBefore(dayjs()) && dayjs(dateTo).isAfter(dayjs()));
const isPast = (dateTo) => dayjs(dateTo).isBefore(dayjs());

const filter = {
  [FilterType.EVERYTHING]: (points) => points,
  [FilterType.FUTURE]: (points) => points.filter((point) => isFuture(point.dateFrom)),
  [FilterType.PRESENT]: (points) => points.filter((point) => isPresent(point.dateFrom, point.dateTo)),
  [FilterType.PAST]: (points) => points.filter((point) => isPast(point.dateTo)),
};

export {filter};
