// Компонент сообщения об ошибке загрузки данных с сервера

import AbstractView from '../framework/view/abstract-view.js';

// Генерирует HTML разметку сообщения об ошибке
function createFailedLoadDataTemplate() {
  return '<p class="trip-events__msg">Failed to load latest route information</p>';
}

export default class FailedLoadDataView extends AbstractView {
  get template() {
    return createFailedLoadDataTemplate();
  }
}
