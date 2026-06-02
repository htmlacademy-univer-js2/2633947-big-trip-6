// Компонент блока информации о путешествии в шапке сайта (маршрут, даты, общая стоимость)

import AbstractView from '../framework/view/abstract-view.js';

// Генерирует HTML разметку блока информации
function createTripInfoTemplate(tripInfo) {
  const {title, dates, cost} = tripInfo;

  return (
    `<section class="trip-main__trip-info  trip-info">
      <div class="trip-info__main">
        <h1 class="trip-info__title">${title}</h1>
        <p class="trip-info__dates">${dates}</p>
      </div>
      <p class="trip-info__cost">
        Total: &euro;&nbsp;<span class="trip-info__cost-value">${cost}</span>
      </p>
    </section>`
  );
}

export default class TripInfoView extends AbstractView {
  #tripInfo = null;

  constructor({tripInfo}) {
    super();
    this.#tripInfo = tripInfo;
  }

  get template() {
    return createTripInfoTemplate(this.#tripInfo);
  }
}
