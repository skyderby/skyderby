class Places::SelectOptionsController < ApplicationController
  include HotSelectOptions

  layout false

  def index
    @places = Place.includes(:country)
                   .order('countries.name, places.name')
                   .search(search_query)
                   .paginate(page:, per_page: 25)

    respond_with_no_results(params[:frame_id]) if @places.empty? && @places.current_page == 1
  end

  def search_query
    params[:term]
  end
end
