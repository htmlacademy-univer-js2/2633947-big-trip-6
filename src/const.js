// Файл: const.js
// Глобальные константы проекта: типы событий, сортировка, действия пользователя,
// типы обновлений модели и типы фильтров

// Список всех возможных типов точек маршрута
const TRIP_TYPES = ['taxi', 'bus', 'train', 'ship', 'drive', 'flight', 'check-in', 'sightseeing', 'restaurant'];

// Типы сортировки списка точек
const SortType = {
  DAY: 'day',
  EVENT: 'event',
  TIME: 'time',
  PRICE: 'price',
  OFFER: 'offer',
};

// Действия, которые может совершить пользователь
const UserAction = {
  UPDATE_POINT: 'UPDATE_POINT',
  ADD_POINT: 'ADD_POINT',
  DELETE_POINT: 'DELETE_POINT',
};

// Типы обновлений для уведомления подписчиков (модели -> презентеры)
const UpdateType = {
  PATCH: 'PATCH',
  MINOR: 'MINOR',
  MAJOR: 'MAJOR',
  INIT: 'INIT',
};

// Типы фильтров для отображения списка точек
const FilterType = {
  EVERYTHING: 'everything',
  FUTURE: 'future',
  PRESENT: 'present',
  PAST: 'past',
};

export {TRIP_TYPES, SortType, UserAction, UpdateType, FilterType};
