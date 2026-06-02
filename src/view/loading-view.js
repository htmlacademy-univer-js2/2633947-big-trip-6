// Компонент индикатора загрузки данных

import AbstractView from '../framework/view/abstract-view.js';

// Генерирует HTML разметку сообщения о загрузке
function createLoadingTemplate() {
  return '<p class="trip-events__msg">Loading...</p>';
}

export default class LoadingView extends AbstractView {
  get template() {
    return createLoadingTemplate();
  }
}
