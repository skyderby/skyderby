class EventsController < ApplicationController
  def index
    rows_per_page = request.variant.include?(:mobile) ? 5 : 10

    @events =
      EventList
      .listable
      .includes(place: :country)
      .by_activity(index_params[:kind])
      .search(index_params[:query])
      .page(page).per(rows_per_page)

    respond_to do |format|
      format.html
      format.turbo_stream
    end
  end

  def new
    respond_not_authorized unless EventList.creatable?
  end

  def show
    event = Event.find(params[:id])

    if event.hungary_boogie?
      redirect_to boogie_path(event)
    else
      redirect_to performance_competition_path(event)
    end
  end

  private

  def index_params
    params.permit(:kind, :query)
  end
  helper_method :index_params
end
