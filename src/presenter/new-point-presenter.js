// Презентер формы создания новой точки маршрута. Управляет отображением пустой формы,
// её отправкой и закрытием.

import {remove, render, RenderPosition} from '../framework/render.js';
import EditPointView from '../view/edit-point-view.js';
import {UserAction, UpdateType} from '../const.js';

export default class NewPointPresenter {
  #pointListContainer = null;
  #changeData = null;
  #pointEditComponent = null;
  #destroyCallback = null;
  #destinations = null;
  #offers = null;

  constructor(pointListContainer, changeData) {
    this.#pointListContainer = pointListContainer;
    this.#changeData = changeData;
  }

  // Инициализация формы создания: запоминаем колбэк, данные и рендерим форму
  init(callback, destinations, offers) {
    this.#destroyCallback = callback;
    this.#destinations = destinations;
    this.#offers = offers;

    // Если форма уже открыта – ничего не делаем
    if (this.#pointEditComponent !== null) {
      return;
    }

    // Создаём компонент без переданной точки (пустая форма)
    this.#pointEditComponent = new EditPointView({
      pointDestinations: this.#destinations,
      pointOffers: this.#offers,
      onFormSubmit: this.#handleFormSubmit,
      onDeleteClick: this.#handleDeleteClick // отмена (Cancel)
    });

    // Рендерим форму в начало списка
    render(this.#pointEditComponent, this.#pointListContainer, RenderPosition.AFTERBEGIN);

    // Слушаем Escape для закрытия формы
    document.addEventListener('keydown', this.#escKeyDownHandler);
  }

  // Уничтожение формы: удаляем из DOM и снимаем слушатели
  destroy() {
    if (this.#pointEditComponent === null) {
      return;
    }

    this.#destroyCallback?.(); // уведомляем внешний код о закрытии (разблокируем кнопку New Event)
    remove(this.#pointEditComponent);
    this.#pointEditComponent = null;
    document.removeEventListener('keydown', this.#escKeyDownHandler);
  }

  // Устанавливает состояние "сохранение" (блокирует форму, меняет кнопку)
  setSaving() {
    this.#pointEditComponent.updateElement({
      isDisabled: true,
      isSaving: true,
    });
  }

  // Обработка ошибки при сохранении: трясём форму и возвращаем активное состояние
  setAborting() {
    const resetFormState = () => {
      this.#pointEditComponent.updateElement({
        isDisabled: false,
        isSaving: false,
        isDeleting: false,
      });
    };
    this.#pointEditComponent.shake(resetFormState);
  }

  // Отправка формы: передаём данные точки в board-presenter
  #handleFormSubmit = (point) => {
    this.#changeData(
      UserAction.ADD_POINT,
      UpdateType.MINOR,
      point,
    );
  };

  // Нажатие на кнопку Cancel – закрываем форму
  #handleDeleteClick = () => {
    this.destroy();
  };

  // Обработчик нажатия Escape для закрытия формы
  #escKeyDownHandler = (evt) => {
    if (evt.key === 'Escape' || evt.key === 'Esc') {
      evt.preventDefault();
      this.destroy();
    }
  };
}
