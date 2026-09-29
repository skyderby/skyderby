module Api
  module V1
    class ManufacturersController < Api::ApplicationController
      def show
        @manufacturer = Manufacturer.find(params[:id])
      end
    end
  end
end
