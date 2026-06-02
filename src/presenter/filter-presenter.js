// Презентер фильтров. Отвечает за отображение блока фильтров и обработку выбора фильтра

import FilterView from '../view/filter-view.js';
import {render, replace, remove} from '../framework/render.js';
import {FilterType, UpdateType} from '../const.js';
import {filter} from '../utils/filter.js';

export default class FilterPresenter {
  #filterContainer = null;
  #filterModel = null;
  #pointsModel = null;

  #filterComponent = null;

  constructor({filterContainer, filterModel, pointsModel}) {
    this.#filterContainer = filterContainer;
    this.#filterModel = filterModel;
    this.#pointsModel = pointsModel;

    // Подписываемся на изменения в моделях, чтобы перерисовывать фильтры
    this.#pointsModel.addObserver(this.#handleModelEvent);
    this.#filterModel.addObserver(this.#handleModelEvent);
  }

  // Геттер: формирует массив фильтров с их типами и количеством подходящих точек
  get filters() {
    const points = this.#pointsModel.points;
    // Для каждого типа фильтра (everything, future, present, past) считаем количество точек
    return Object.values(FilterType).map((type) => ({
      type,
      count: filter[type](points).length,
    }));
  }

  // Инициализация (или обновление) компонента фильтров
  init() {
    const filters = this.filters;
    const prevFilterComponent = this.#filterComponent;

    // Создаём новый компонент с актуальными данными
    this.#filterComponent = new FilterView({
      filters,
      currentFilterType: this.#filterModel.filter,
      onFilterTypeChange: this.#handleFilterTypeChange
    });

    // Если компонента ещё не было – рендерим, иначе заменяем старый на новый
    if (prevFilterComponent === null) {
      render(this.#filterComponent, this.#filterContainer);
      return;
    }

    replace(this.#filterComponent, prevFilterComponent);
    remove(prevFilterComponent);
  }

  // Обработчик событий от моделей (обновление фильтров)
  #handleModelEvent = () => {
    this.init();
  };

  // Обработчик изменения выбранного фильтра
  #handleFilterTypeChange = (filterType) => {
    // Если фильтр не изменился – ничего не делаем
    if (this.#filterModel.filter === filterType) {
      return;
    }
    // Устанавливаем новый фильтр в модели, передаём тип обновления MAJOR (полная перерисовка доски)
    this.#filterModel.setFilter(UpdateType.MAJOR, filterType);
  };
}
