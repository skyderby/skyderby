module Api
  module V1
    module Places
      class ExitMeasurementsController < ApplicationController
        def index
          @lines = PlaceLine.joins(:place)
                            .includes(place: :country)
                            .order('countries.name, places.name')
                            .where(place: Place.search(search_query))
                            .group_by(&:country_name)

          respond_to do |format|
            format.json
          end
        end

        def show
          @exit_measurements = ExitMeasurement.where(place_line_id: params[:id])
                                              .order(:altitude)

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
