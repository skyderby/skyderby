class EventsController < ApplicationController
  def index
    authorize Event

    rows_per_page = request.variant.include?(:mobile) ? 5 : 10

    @events =
      policy_scope(Event.all)
      .includes(place: :country)
      .by_activity(index_params[:kind])
      .search(index_params[:query])
      .paginate(page:, per_page: rows_per_page)

    fresh_when @events

    respond_to do |format|
      format.html
      format.turbo_stream
    end
  end

  def new
    authorize Event
  end

  private

  def index_params
    params.permit(:kind, :query)
  end
  helper_method :index_params
end
