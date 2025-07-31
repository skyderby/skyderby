class Countries::SelectOptionsController < ApplicationController
  layout false

  def index
    @countries = Country.order(:name).search(params[:term]).paginate(page:, per_page: 25)
  end
end
