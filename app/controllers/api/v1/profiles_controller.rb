module Api
  module V1
    class ProfilesController < Api::ApplicationController
      def show
        @profile =
          Profile
          .includes(personal_top_scores: { virtual_competition: :group })
          .find(params[:id])
      end
    end
  end
end
