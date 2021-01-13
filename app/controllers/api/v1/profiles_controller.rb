module Api
  module V1
    class ProfilesController < Api::ApplicationController
      def index
        @profiles =
          Profile
          .order(:name)
          .then(&method(:search))
          .paginate(page: current_page, per_page: rows_per_page)
      end

      def show
        @profile = authorize Profile.find(params[:id])
      end

      private

      def search(relation)
        return relation.none if params[:search].to_s.length < 3

        relation.search(params[:search])
      end
    end
  end
end
