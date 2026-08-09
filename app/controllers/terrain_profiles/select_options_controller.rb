module TerrainProfiles
  class SelectOptionsController < ApplicationController
    include HotSelectOptions

    layout false

    def index
      @terrain_profiles =
        TerrainProfile
        .viewable
        .with_place
        .order(Arel.sql('terrain_profiles.published_at IS NULL DESC, places.name'))
        .order('terrain_profiles.name')

      @terrain_profiles =
        if params[:place_id].present?
          @terrain_profiles.where(place_id: params[:place_id]).with_measurements
        else
          @terrain_profiles.search(params[:term])
        end

      @terrain_profiles = @terrain_profiles.page(page).per(25)

      return unless @terrain_profiles.empty? && @terrain_profiles.current_page == 1

      respond_with_no_results(params[:frame_id])
    end
  end
end
