// Презентер блока информации о путешествии в шапке сайта (маршрут, даты, общая стоимость)

import TripInfoView from '../view/trip-info-view.js';
import {render, remove, RenderPosition, replace} from '../framework/render.js';
import {sortPointDay} from '../utils/sort.js';
import {formatTripDates} from '../utils/date.js';

export default class TripInfoPresenter {
  #tripInfoContainer = null;
  #pointsModel = null;
  #tripInfoComponent = null;

  constructor({tripInfoContainer, pointsModel}) {
    this.#tripInfoContainer = tripInfoContainer;
    this.#pointsModel = pointsModel;
    // Подписываемся на изменения модели, чтобы обновлять информацию
    this.#pointsModel.addObserver(this.#handleModelEvent);
  }

  // Публичный метод: создаёт или обновляет блок информации о путешествии
  init() {
    const points = this.#pointsModel.points;

    // Если точек нет, удаляем компонент (если он был)
    if (points.length === 0) {
      if (this.#tripInfoComponent) {
        remove(this.#tripInfoComponent);
        this.#tripInfoComponent = null;
      }
      return;
    }

    // Сортируем точки по дате, чтобы получить начало и конец путешествия
    const sortedPoints = [...points].sort(sortPointDay);
    const tripInfo = this.#calculateTripInfo(sortedPoints);

    const prevTripInfoComponent = this.#tripInfoComponent;
    this.#tripInfoComponent = new TripInfoView({tripInfo});

    // Если компонента ещё нет – рендерим, иначе заменяем старый на новый
    if (prevTripInfoComponent === null) {
      render(this.#tripInfoComponent, this.#tripInfoContainer, RenderPosition.AFTERBEGIN);
      return;
    }

    replace(this.#tripInfoComponent, prevTripInfoComponent);
    remove(prevTripInfoComponent);
  }

  // Обработчик событий модели: обновляем информацию при любом изменении точек
  #handleModelEvent = () => {
    this.init();
  };

  // Вычисляет маршрут, даты и общую стоимость на основе массива точек
  #calculateTripInfo(points) {
    const startPoint = points[0];
    const endPoint = points[points.length - 1];

    // Формируем название маршрута: список городов через тире, если больше 3 – только первый и последний
    const cityNames = points.map((point) => {
      const destination = this.#pointsModel.destinations.find((dest) => dest.id === point.destination);
      return destination ? destination.name : '';
    });

    let routeTitle = '';
    if (cityNames.length > 3) {
      routeTitle = `${cityNames[0]} &mdash; ... &mdash; ${cityNames[cityNames.length - 1]}`;
    } else {
      routeTitle = cityNames.join(' &mdash; ');
    }

    // Форматируем даты начала и конца путешествия
    const dates = formatTripDates(startPoint.dateFrom, endPoint.dateTo);

    // Считаем общую стоимость: базовая цена точки + цены выбранных опций
    let totalCost = 0;
    points.forEach((point) => {
      totalCost += point.basePrice;
      const offers = this.#pointsModel.offers.find((o) => o.type === point.type)?.offers || [];
      const selectedOffers = offers.filter((offer) => point.offers.includes(offer.id));
      selectedOffers.forEach((offer) => {
        totalCost += offer.price;
      });
    });

    return {
      title: routeTitle,
      dates: dates,
      cost: totalCost
    };
  }
}
