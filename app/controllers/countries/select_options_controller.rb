class Countries::SelectOptionsController < ApplicationController
  include HotSelectOptions

  layout false

  def index
    @countries = Country.order(:name).search(params[:term]).paginate(page:, per_page: 25)

    respond_with_no_results(params[:frame_id]) if @countries.empty? && @countries.current_page == 1
  end
end
