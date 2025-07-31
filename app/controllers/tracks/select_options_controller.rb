class Tracks::SelectOptionsController < ApplicationController
  layout false

  def index
    @tracks =
      Track
        .order(recorded_at: :desc)
        .then { |tracks| profile_id ? tracks.where(profile_id: profile_id) : tracks }
        .search(search_query)
        .paginate(page:, per_page: 25)
  end

  private

  def search_query = params[:term]

  def profile_id = params[:profile_id]
end
