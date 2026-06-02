// Файл: board-presenter.js
// Главный презентер доски событий. Управляет отрисовкой всего списка точек маршрута,
// сортировкой, фильтрацией, а также созданием и редактированием точек.

import SortView from '../view/sort-view.js';
import EventListView from '../view/event-list-view.js';
import ListEmptyView from '../view/list-empty-view.js';
import LoadingView from '../view/loading-view.js';
import FailedLoadDataView from '../view/failed-load-data-view.js';
import PointPresenter from './point-presenter.js';
import NewPointPresenter from './new-point-presenter.js';
import {render, remove} from '../framework/render.js';
import {SortType, UserAction, UpdateType, FilterType} from '../const.js';
import {sortPointDay, sortPointTime, sortPointPrice} from '../utils/sort.js';
import {filter} from '../utils/filter.js';
import UiBlocker from '../framework/ui-blocker/ui-blocker.js';

// Константы для блокировки интерфейса на время отправки запросов
const TimeLimit = {
  LOWER_LIMIT: 350,
  UPPER_LIMIT: 1000,
};

export default class BoardPresenter {
  // Приватные поля
  #boardContainer = null;
  #pointsModel = null;
  #filterModel = null;

  #sortComponent = null;
  #eventListComponent = new EventListView();
  #listEmptyComponent = null;
  #loadingComponent = new LoadingView();
  #failedLoadDataComponent = new FailedLoadDataView();

  #pointPresenters = new Map();
  #newPointPresenter = null;
  #currentSortType = SortType.DAY;
  #filterType = FilterType.EVERYTHING;
  #isLoading = true;
  #isError = false;
  #uiBlocker = new UiBlocker({
    lowerLimit: TimeLimit.LOWER_LIMIT,
    upperLimit: TimeLimit.UPPER_LIMIT
  });

  constructor({boardContainer, pointsModel, filterModel}) {
    this.#boardContainer = boardContainer;
    this.#pointsModel = pointsModel;
    this.#filterModel = filterModel;

    // Создаём презентер для новой точки, передаём ему колбэк обработки действий
    this.#newPointPresenter = new NewPointPresenter(this.#eventListComponent.element, this.#handleViewAction);

    // Подписываемся на изменения моделей
    this.#pointsModel.addObserver(this.#handleModelEvent);
    this.#filterModel.addObserver(this.#handleModelEvent);
  }

  // Геттер: возвращает отфильтрованные и отсортированные точки
  get points() {
    this.#filterType = this.#filterModel.filter;
    const points = this.#pointsModel.points;
    const filteredPoints = filter[this.#filterType](points);

    switch (this.#currentSortType) {
      case SortType.TIME:
        return filteredPoints.sort(sortPointTime);
      case SortType.PRICE:
        return filteredPoints.sort(sortPointPrice);
    }
    return filteredPoints.sort(sortPointDay);
  }

  // Геттеры для направлений и опций (прокси к модели)
  get destinations() {
    return this.#pointsModel.destinations;
  }

  get offers() {
    return this.#pointsModel.offers;
  }

  // Публичный метод: инициализация презентера
  init() {
    this.#renderBoard();
  }

  // Создание новой точки: сброс сортировки, фильтра и вызов презентера новой точки
  createPoint(callback) {
    this.#currentSortType = SortType.DAY;
    this.#filterModel.setFilter(UpdateType.MAJOR, FilterType.EVERYTHING);
    this.#newPointPresenter.init(callback, this.destinations, this.offers);
  }

  // Обработчик переключения режима редактирования (закрывает форму и сбрасывает презентеры)
  #handleModeChange = () => {
    this.#newPointPresenter.destroy();
    this.#pointPresenters.forEach((presenter) => presenter.resetView());
  };

  // Обработчик действий пользователя (создание, редактирование, удаление)
  #handleViewAction = async (actionType, updateType, update) => {
    this.#uiBlocker.block(); // блокируем интерфейс на время запроса

    switch (actionType) {
      case UserAction.UPDATE_POINT:
        this.#pointPresenters.get(update.id).setSaving();
        try {
          await this.#pointsModel.updatePoint(updateType, update);
        } catch(err) {
          this.#pointPresenters.get(update.id).setAborting();
        }
        break;
      case UserAction.ADD_POINT:
        this.#newPointPresenter.setSaving();
        try {
          await this.#pointsModel.addPoint(updateType, update);
        } catch(err) {
          this.#newPointPresenter.setAborting();
        }
        break;
      case UserAction.DELETE_POINT:
        this.#pointPresenters.get(update.id).setDeleting();
        try {
          await this.#pointsModel.deletePoint(updateType, update);
        } catch(err) {
          this.#pointPresenters.get(update.id).setAborting();
        }
        break;
    }

    this.#uiBlocker.unblock();
  };

  // Обработчик событий от модели (обновление данных)
  #handleModelEvent = (updateType, data) => {
    switch (updateType) {
      case UpdateType.PATCH:
        this.#pointPresenters.get(data.id).init(data, this.destinations, this.offers);
        break;
      case UpdateType.MINOR:
        this.#clearBoard();
        this.#renderBoard();
        break;
      case UpdateType.MAJOR:
        this.#clearBoard({resetSortType: true});
        this.#renderBoard();
        break;
      case UpdateType.INIT:
        this.#isLoading = false;
        if (data && data.isError) {
          this.#isError = true;
        }
        remove(this.#loadingComponent);
        this.#renderBoard();
        break;
    }
  };

  // Обработчик изменения типа сортировки
  #handleSortTypeChange = (sortType) => {
    if (this.#currentSortType === sortType) {
      return;
    }
    this.#currentSortType = sortType;
    this.#clearBoard();
    this.#renderBoard();
  };

  // Рендер отдельной точки
  #renderPoint(point) {
    const pointPresenter = new PointPresenter(this.#eventListComponent.element, this.#handleViewAction, this.#handleModeChange);
    pointPresenter.init(point, this.destinations, this.offers);
    this.#pointPresenters.set(point.id, pointPresenter);
  }

  // Рендер всех точек
  #renderPoints(points) {
    points.forEach((point) => this.#renderPoint(point));
  }

  // Рендер заглушки "нет событий"
  #renderListEmpty() {
    this.#listEmptyComponent = new ListEmptyView(this.#filterType);
    render(this.#listEmptyComponent, this.#boardContainer);
  }

  // Рендер индикатора загрузки
  #renderLoading() {
    render(this.#loadingComponent, this.#boardContainer);
  }

  // Рендер сообщения об ошибке загрузки
  #renderFailedLoadData() {
    render(this.#failedLoadDataComponent, this.#boardContainer);
  }

  // Рендер компонента сортировки
  #renderSort() {
    this.#sortComponent = new SortView({
      currentSortType: this.#currentSortType,
      onSortTypeChange: this.#handleSortTypeChange
    });
    render(this.#sortComponent, this.#boardContainer);
  }

  // Рендер контейнера списка событий
  #renderEventList() {
    render(this.#eventListComponent, this.#boardContainer);
  }

  // Очистка доски: удаление всех презентеров и компонентов
  #clearBoard({resetSortType = false} = {}) {
    this.#newPointPresenter.destroy();
    this.#pointPresenters.forEach((presenter) => presenter.destroy());
    this.#pointPresenters.clear();

    remove(this.#sortComponent);
    remove(this.#loadingComponent);
    remove(this.#failedLoadDataComponent);
    if (this.#listEmptyComponent) {
      remove(this.#listEmptyComponent);
    }

    if (resetSortType) {
      this.#currentSortType = SortType.DAY;
    }
  }

  // Основной метод рендеринга всей доски
  #renderBoard() {
    if (this.#isLoading) {
      this.#renderLoading();
      return;
    }

    if (this.#isError) {
      this.#renderFailedLoadData();
      return;
    }

    const points = this.points;
    if (points.length === 0) {
      this.#renderListEmpty();
      return;
    }

    this.#renderSort();
    this.#renderEventList();
    this.#renderPoints(points);
  }
}
