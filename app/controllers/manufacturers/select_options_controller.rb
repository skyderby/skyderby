class Manufacturers::SelectOptionsController < ApplicationController
  layout false

  def index
    @manufacturers = Manufacturer.order(:name).search(search_query)
  end

  def search_query
    params[:term]
  end
end
