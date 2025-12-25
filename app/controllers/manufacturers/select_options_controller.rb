class Manufacturers::SelectOptionsController < ApplicationController
  include HotSelectOptions

  layout false

  def index
    @manufacturers = Manufacturer.order(:name).search(search_query)

    respond_with_no_results(params[:frame_id]) if @manufacturers.empty?
  end

  def search_query
    params[:term]
  end
end
