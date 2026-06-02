// Презентер одной точки маршрута. Управляет переключением между режимом просмотра (PointView)
// и режимом редактирования (EditPointView), обрабатывает сохранение, удаление и добавление в избранное.

import PointView from '../view/point-view.js';
import EditPointView from '../view/edit-point-view.js';
import {render, replace, remove} from '../framework/render.js';
import {UserAction, UpdateType} from '../const.js';
import dayjs from 'dayjs';

// Возможные режимы отображения
const Mode = {
  DEFAULT: 'DEFAULT',
  EDITING: 'EDITING',
};

export default class PointPresenter {
  #pointListContainer = null;
  #changeData = null;
  #changeMode = null;

  #pointComponent = null;
  #pointEditComponent = null;

  #point = null;
  #destinations = null;
  #offers = null;
  #mode = Mode.DEFAULT;

  constructor(pointListContainer, changeData, changeMode) {
    this.#pointListContainer = pointListContainer;
    this.#changeData = changeData;
    this.#changeMode = changeMode;
  }

  // Инициализация презентера: создаёт компоненты и отрисовывает точку
  init(point, destinations, offers) {
    this.#point = point;
    this.#destinations = destinations;
    this.#offers = offers;

    const prevPointComponent = this.#pointComponent;
    const prevPointEditComponent = this.#pointEditComponent;

    // Создаём новый компонент просмотра
    this.#pointComponent = new PointView({
      point: this.#point,
      pointDestinations: this.#destinations,
      pointOffers: this.#offers,
      onEditClick: this.#handleEditClick,
      onFavoriteClick: this.#handleFavoriteClick, // клик по звезде избранного
    });

    // Создаём новый компонент редактирования
    this.#pointEditComponent = new EditPointView({
      point: this.#point,
      pointDestinations: this.#destinations,
      pointOffers: this.#offers,
      onFormSubmit: this.#handleFormSubmit,
      onFormClick: this.#handleFormClick,
      onDeleteClick: this.#handleDeleteClick, // удаление
    });

    // Если рендерим впервые
    if (prevPointComponent === null || prevPointEditComponent === null) {
      render(this.#pointComponent, this.#pointListContainer);
      return;
    }

    // Заменяем старые компоненты на новые в зависимости от текущего режима
    if (this.#mode === Mode.DEFAULT) {
      replace(this.#pointComponent, prevPointComponent);
    }
    if (this.#mode === Mode.EDITING) {
      replace(this.#pointEditComponent, prevPointEditComponent);
    }

    remove(prevPointComponent);
    remove(prevPointEditComponent);
  }

  // Полное удаление презентера (убираем компоненты из DOM)
  destroy() {
    remove(this.#pointComponent);
    remove(this.#pointEditComponent);
  }

  // Сброс режима редактирования (закрывает форму, если она открыта)
  resetView() {
    if (this.#mode !== Mode.DEFAULT) {
      this.#pointEditComponent.reset(this.#point);
      this.#replaceFormToPoint();
    }
  }

  // Устанавливает состояние "сохранение" в форме редактирования
  setSaving() {
    if (this.#mode === Mode.EDITING) {
      this.#pointEditComponent.updateElement({
        isDisabled: true,
        isSaving: true,
      });
    }
  }

  // Устанавливает состояние "удаление" в форме редактирования
  setDeleting() {
    if (this.#mode === Mode.EDITING) {
      this.#pointEditComponent.updateElement({
        isDisabled: true,
        isDeleting: true,
      });
    }
  }

  // Обработка ошибки: трясём активный компонент (карточку или форму)
  setAborting() {
    if (this.#mode === Mode.DEFAULT) {
      this.#pointComponent.shake();
      return;
    }

    const resetFormState = () => {
      this.#pointEditComponent.updateElement({
        isDisabled: false,
        isSaving: false,
        isDeleting: false,
      });
    };
    this.#pointEditComponent.shake(resetFormState);
  }

  // Переключение из режима просмотра в режим редактирования
  #replacePointToForm = () => {
    replace(this.#pointEditComponent, this.#pointComponent);
    document.addEventListener('keydown', this.#escKeyDownHandler);
    this.#changeMode(); // уведомляем, что открыта форма (закрываем другие)
    this.#mode = Mode.EDITING;
  };

  // Переключение из режима редактирования в режим просмотра
  #replaceFormToPoint = () => {
    replace(this.#pointComponent, this.#pointEditComponent);
    document.removeEventListener('keydown', this.#escKeyDownHandler);
    this.#mode = Mode.DEFAULT;
  };

  // Обработчик нажатия Escape – закрывает форму без сохранения
  #escKeyDownHandler = (evt) => {
    if (evt.key === 'Escape' || evt.key === 'Esc') {
      evt.preventDefault();
      this.#pointEditComponent.reset(this.#point);
      this.#replaceFormToPoint();
    }
  };

  // Клик по кнопке редактирования (стрелка вниз)
  #handleEditClick = () => {
    this.#replacePointToForm();
  };

  // Клик по звезде избранного
  #handleFavoriteClick = () => {
    this.#changeData(
      UserAction.UPDATE_POINT,
      UpdateType.MINOR,
      {...this.#point, isFavorite: !this.#point.isFavorite},
    );
  };

  // Отправка формы редактирования (сохранение)
  #handleFormSubmit = (update) => {
    // Определяем, изменились ли даты или цена – для выбора типа обновления
    const isMinorUpdate =
      !isDatesEqual(this.#point.dateFrom, update.dateFrom) ||
      !isDatesEqual(this.#point.dateTo, update.dateTo) ||
      this.#point.basePrice !== update.basePrice;

    this.#changeData(
      UserAction.UPDATE_POINT,
      isMinorUpdate ? UpdateType.MINOR : UpdateType.PATCH,
      update,
    );
  };

  // Удаление точки
  #handleDeleteClick = (point) => {
    this.#changeData(
      UserAction.DELETE_POINT,
      UpdateType.MINOR,
      point,
    );
  };

  // Закрытие формы через кнопку стрелки вверх
  #handleFormClick = () => {
    this.#pointEditComponent.reset(this.#point);
    this.#replaceFormToPoint();
  };
}

// Вспомогательная функция: сравнивает даты без учёта времени (только день)
function isDatesEqual(dateA, dateB) {
  return (dateA === null && dateB === null) || dayjs(dateA).isSame(dateB, 'D');
}
