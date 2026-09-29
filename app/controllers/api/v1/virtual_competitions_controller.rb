module Api
  module V1
    class VirtualCompetitionsController < Api::ApplicationController
      def index
        @index = ::VirtualCompetitions::Index.new(include_archived: params[:include_archived] == 'true')
      end

      def show
        @competition =
          VirtualCompetition
          .includes(:group, :finish_line, place: :country, sponsors: { logo_attachment: :blob })
          .find(params[:id])
      end
    end
  end
end
