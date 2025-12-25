class Profiles::SelectOptionsController < ApplicationController
  layout false

  def index
    @profiles =
      Profile
      .search(params[:term])
      .order(:name)
      .paginate(page:, per_page: 25)
  end
end
