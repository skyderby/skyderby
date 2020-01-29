module Api
  module V1
    class ProfilesController < Api::ApplicationController
      def index
        authorize Profile

        @profiles =
          Profile.search(params[:search])
          .order(:name)
          .paginate(page: current_page, per_page: rows_per_page)
      end

      def show
        @profile = Profile.find(params[:id])

        authorize @profile
      end
    end
  end
end
