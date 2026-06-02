// Компонент-контейнер для списка точек маршрута (пустой ul)

import AbstractView from '../framework/view/abstract-view.js';

// Генерирует HTML разметку пустого списка
function createEventListTemplate() {
  return '<ul class="trip-events__list"></ul>';
}

export default class EventListView extends AbstractView {
  get template() {
    return createEventListTemplate();
  }
}
