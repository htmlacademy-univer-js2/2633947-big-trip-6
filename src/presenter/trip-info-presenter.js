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

    this.#pointsModel.addObserver(this.#handleModelEvent);
  }

  init() {
    const points = this.#pointsModel.points;

    if (points.length === 0) {
      if (this.#tripInfoComponent) {
        remove(this.#tripInfoComponent);
        this.#tripInfoComponent = null;
      }
      return;
    }

    const sortedPoints = [...points].sort(sortPointDay);
    const tripInfo = this.#calculateTripInfo(sortedPoints);

    const prevTripInfoComponent = this.#tripInfoComponent;

    this.#tripInfoComponent = new TripInfoView({tripInfo});

    if (prevTripInfoComponent === null) {
      render(this.#tripInfoComponent, this.#tripInfoContainer, RenderPosition.AFTERBEGIN);
      return;
    }

    replace(this.#tripInfoComponent, prevTripInfoComponent);
    remove(prevTripInfoComponent);
  }

  #handleModelEvent = () => {
    this.init();
  };

  #calculateTripInfo(points) {
    const startPoint = points[0];
    const endPoint = points[points.length - 1];

    // Route
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

    // Dates
    const dates = formatTripDates(startPoint.dateFrom, endPoint.dateTo);

    // Cost
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
