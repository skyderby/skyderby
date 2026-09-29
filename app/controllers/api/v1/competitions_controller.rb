module Api
  module V1
    class CompetitionsController < Api::ApplicationController
      DEFAULT_PER_PAGE = 20
      MAX_PER_PAGE = 100

      def index
        @competitions =
          EventList
          .listable
          .includes(place: :country)
          .by_activity(params[:kind])
          .search(params[:query])
          .page(page)
          .per(per_page)
      end

      private

      def per_page = (params[:per].presence || DEFAULT_PER_PAGE).to_i.clamp(1, MAX_PER_PAGE)
    end
  end
end
