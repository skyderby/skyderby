module Api
  module V1
    class TournamentsController < Api::ApplicationController
      before_action -> { doorkeeper_authorize! :write }, only: %i[create update]
      before_action :require_registered_user!, only: %i[create update]
      before_action :require_admin!, only: :create
      before_action :set_editable_tournament, only: :update

      def show
        @tournament = find_tournament(params[:id])
        raise ActiveRecord::RecordNotFound unless @tournament.viewable?

        fresh_when etag: [
          @tournament,
          @tournament.competitors.map(&:updated_at).max,
          @tournament.competitors.size,
          @tournament.rounds.exists?,
          @tournament.qualification_rounds.pick(Arel.sql('MAX(updated_at)'), Arel.sql('COUNT(*)'))
        ]
      end

      def create
        @tournament = Tournament.new(responsible: current_user)
        save_tournament(:created)
      end

      def update
        save_tournament(:ok)
      end

      private

      def find_tournament(id)
        Tournament
          .includes(
            :finish_line,
            place: :country,
            organizers: { user: :profile },
            sponsors: { logo_attachment: :blob },
            competitors: [{ suit: :manufacturer }, { sponsor_logo_attachment: :blob }]
          )
          .find(id)
      end

      def set_editable_tournament
        @tournament = Tournament.find(params[:id])
        respond_not_authorized unless @tournament.editable?
      end

      def save_tournament(status)
        @tournament.assign_attributes(tournament_params)

        if valid_finish_line? && @tournament.save
          @tournament = find_tournament(@tournament.id)
          render :show, status:
        else
          render_errors @tournament.errors.full_messages, status: :unprocessable_content
        end
      rescue ArgumentError => e
        render_errors [e.message], status: :unprocessable_content
      end

      def valid_finish_line?
        return true if @tournament.finish_line.nil? || @tournament.finish_line.place_id == @tournament.place_id

        @tournament.errors.add(:finish_line, :invalid)
        false
      end

      def tournament_params
        params.require(:event).permit(
          :name,
          :place_id,
          :finish_line_id,
          :starts_at,
          :bracket_size,
          :has_qualification,
          :qualification_scoring,
          :visibility,
          :status
        )
      end
    end
  end
end
