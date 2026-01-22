class Tracks::SelectOptionsController < ApplicationController
  include HotSelectOptions

  layout false

  def index
    @tracks =
      Track
      .order(recorded_at: :desc)
      .then { |tracks| profile_id ? tracks.where(profile_id: profile_id) : tracks }
      .search(search_query)
      .page(page).per(25)

    respond_with_no_results(params[:frame_id]) if @tracks.empty? && @tracks.current_page == 1
  end

  private

  def search_query = params[:term]

  def profile_id = params[:profile_id]
end
