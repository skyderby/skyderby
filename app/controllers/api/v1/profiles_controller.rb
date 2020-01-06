module Api
  module V1
    class ProfilesController < Api::ApplicationController
      def index
        @profiles =
          Profile.search(params[:search])
          .order(:name)
          .paginate(page: current_page, per_page: rows_per_page)
      end

      def show
        @profile =
          Profile
          .includes(personal_top_scores: { virtual_competition: :group })
          .find(params[:id])
      end
    end
  end
end
