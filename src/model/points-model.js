// Модель для хранения и управления точками маршрута, направлениями и опциями
import Observable from '../framework/observable.js';
import {UpdateType} from '../const.js';

export default class PointsModel extends Observable {
  #pointsApiService = null;
  #points = [];
  #destinations = [];
  #offers = [];

  // Конструктор: сохраняет экземпляр API-сервиса
  constructor({pointsApiService}) {
    super();
    this.#pointsApiService = pointsApiService;
  }

  // Геттеры для доступа к данным извне
  get points() {
    return this.#points;
  }

  get destinations() {
    return this.#destinations;
  }

  get offers() {
    return this.#offers;
  }

  // Загрузка всех данных с сервера при старте приложения
  async init() {
    try {
      const points = await this.#pointsApiService.points;
      this.#destinations = await this.#pointsApiService.destinations;
      this.#offers = await this.#pointsApiService.offers;
      // Адаптация полученных точек под формат клиента
      this.#points = points.map(this.#adaptToClient);
      this._notify(UpdateType.INIT);
    } catch(err) {
      // В случае ошибки очищаем данные и уведомляем о проблеме
      this.#points = [];
      this.#destinations = [];
      this.#offers = [];
      this._notify(UpdateType.INIT, {isError: true});
    }
  }

  // Обновление существующей точки маршрута
  async updatePoint(updateType, update) {
    const index = this.#points.findIndex((point) => point.id === update.id);
    if (index === -1) {
      throw new Error('Can\'t update unexisting point');
    }

    try {
      const response = await this.#pointsApiService.updatePoint(update);
      const updatedPoint = this.#adaptToClient(response);
      // Заменяем старую точку на обновлённую в массиве
      this.#points = [
        ...this.#points.slice(0, index),
        updatedPoint,
        ...this.#points.slice(index + 1),
      ];
      this._notify(updateType, updatedPoint);
    } catch(err) {
      throw new Error('Can\'t update point');
    }
  }

  // Добавление новой точки маршрута
  async addPoint(updateType, update) {
    try {
      const response = await this.#pointsApiService.addPoint(update);
      const newPoint = this.#adaptToClient(response);
      // Новая точка добавляется в начало списка
      this.#points = [newPoint, ...this.#points];
      this._notify(updateType, newPoint);
    } catch(err) {
      throw new Error('Can\'t add point');
    }
  }

  // Удаление точки маршрута
  async deletePoint(updateType, update) {
    const index = this.#points.findIndex((point) => point.id === update.id);
    if (index === -1) {
      throw new Error('Can\'t delete unexisting point');
    }

    try {
      await this.#pointsApiService.deletePoint(update);
      // Удаляем точку из массива
      this.#points = [
        ...this.#points.slice(0, index),
        ...this.#points.slice(index + 1),
      ];
      this._notify(updateType);
    } catch(err) {
      throw new Error('Can\'t delete point');
    }
  }

  // Адаптация точки из серверного формата в клиентский
  #adaptToClient = (point) => {
    const adaptedPoint = {...point,
      basePrice: point['base_price'],
      dateFrom: point['date_from'] !== null ? new Date(point['date_from']) : point['date_from'],
      dateTo: point['date_to'] !== null ? new Date(point['date_to']) : point['date_to'],
      isFavorite: point['is_favorite'],
    };
    // Удаляем оригинальные серверные поля
    delete adaptedPoint['base_price'];
    delete adaptedPoint['date_from'];
    delete adaptedPoint['date_to'];
    delete adaptedPoint['is_favorite'];
    return adaptedPoint;
  };
}
