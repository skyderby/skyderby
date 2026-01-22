module Manage
  class MissingPlacesController < ApplicationController
    def index
      @tracks = Track.where(place: nil)
                     .order(id: :desc)
                     .includes(:pilot, suit: [:manufacturer])
                     .page(page).per(rows_per_page)
    end

    private

    def rows_per_page
      50
    end
  end
end
