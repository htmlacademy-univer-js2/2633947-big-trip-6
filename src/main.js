import BoardPresenter from './presenter/board-presenter.js';
import FilterPresenter from './presenter/filter-presenter.js';
import TripInfoPresenter from './presenter/trip-info-presenter.js';
import PointsModel from './model/points-model.js';
import FilterModel from './model/filter-model.js';
import PointsApiService from './points-api-service.js';

const AUTHORIZATION = `Basic ${Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)}`;
const END_POINT = 'https://24.objects.htmlacademy.pro/big-trip';

const siteMainElement = document.querySelector('.page-main');
const siteHeaderElement = document.querySelector('.page-header');
const tripMainElement = siteHeaderElement.querySelector('.trip-main');
const tripControlsFilters = siteHeaderElement.querySelector('.trip-controls__filters');
const tripEventsElement = siteMainElement.querySelector('.trip-events');

const pointsModel = new PointsModel({
  pointsApiService: new PointsApiService(END_POINT, AUTHORIZATION)
});
const filterModel = new FilterModel();

const tripInfoPresenter = new TripInfoPresenter({
  tripInfoContainer: tripMainElement,
  pointsModel,
});

const boardPresenter = new BoardPresenter({
  boardContainer: tripEventsElement,
  pointsModel,
  filterModel,
});

const filterPresenter = new FilterPresenter({
  filterContainer: tripControlsFilters,
  filterModel,
  pointsModel,
});

const handleNewPointFormClose = () => {
  document.querySelector('.trip-main__event-add-btn').disabled = false;
};

const handleNewPointButtonClick = () => {
  boardPresenter.createPoint(handleNewPointFormClose);
  document.querySelector('.trip-main__event-add-btn').disabled = true;
};

// Initially disable button until data loads
document.querySelector('.trip-main__event-add-btn').disabled = true;
document.querySelector('.trip-main__event-add-btn').addEventListener('click', handleNewPointButtonClick);

tripInfoPresenter.init();
filterPresenter.init();
boardPresenter.init();
pointsModel.init()
  .finally(() => {
    document.querySelector('.trip-main__event-add-btn').disabled = false;
  });
