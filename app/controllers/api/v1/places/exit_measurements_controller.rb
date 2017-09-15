module Api
  module V1
    module Places
      class ExitMeasurementsController < ApplicationController
        def show
          @exit_measurements = ExitMeasurement.order(:altitude).where(place_id: params[:place_id])

          respond_to do |format|
            format.json
          end
        end
      end
    end
  end
end
