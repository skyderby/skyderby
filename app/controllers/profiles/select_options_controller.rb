class Profiles::SelectOptionsController < ApplicationController
  include HotSelectOptions

  layout false

  def index
    @profiles =
      Profile
      .search(params[:term])
      .order(:name)
      .paginate(page:, per_page: 25)

    respond_with_no_results(params[:frame_id]) if @profiles.empty? && @profiles.current_page == 1
  end
end
