module Api
  module V1
    class CountriesController < Api::ApplicationController
      def show
        @country = Country.find(params[:id])
      end
    end
  end
end
