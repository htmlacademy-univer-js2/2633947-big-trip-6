// Модель для хранения и управления состоянием активного фильтра

import Observable from '../framework/observable.js';
import {FilterType} from '../const.js';

export default class FilterModel extends Observable {
  // Текущий тип фильтра. По умолчанию показаны все точки.
  #filter = FilterType.EVERYTHING;

  // Геттер возвращает текущее значение фильтра.
  get filter() {
    return this.#filter;
  }


  // Устанавливает новый фильтр и оповещает всех подписчиков об изменении
  setFilter(updateType, filter) {
    this.#filter = filter;
    this._notify(updateType, filter);
  }
}
