module Manage
  class MissingPlacesController < ApplicationController
    def index
      @tracks = Track.where(place: nil)
                     .order(id: :desc)
                     .includes(:pilot, suit: [:manufacturer])
                     .paginate(page: params[:page], per_page: rows_per_page)
    end

    private

    def rows_per_page
      50
    end
  end
end
