module Api
  module V1
    module Places
      class ExitMeasurementsController < ApplicationController
        def index
          @lines = Place::JumpLine.joins(:place)
                                  .includes(place: :country)
                                  .order('countries.name, places.name')
                                  .where(place: Place.search(search_query))
                                  .group_by(&:country_name)

          respond_to do |format|
            format.json
          end
        end

        def show
          place_line = Place::JumpLine.find(params[:id])
          @exit_measurements = place_line.measurements.order(:altitude)

          fresh_when place_line

          respond_to do |format|
            format.json
          end
        end

        private

        def search_query
          params.dig(:query, :term)
        end
      end
    end
  end
end
