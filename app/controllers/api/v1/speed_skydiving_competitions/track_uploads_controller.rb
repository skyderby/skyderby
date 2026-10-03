module Api
  module V1
    module SpeedSkydivingCompetitions
      class TrackUploadsController < Api::ApplicationController
        include Api::SpeedSkydivingCompetitionScoped
        include Api::EventManagement
        include SpeedSkydivingCompetitionBroadcasts

        def create
          return render_failure t('speed_skydiving_competitions.track_upload.round_missing') if params[:round_id].blank?

          round = @event.rounds.find(params[:round_id])
          competitors = matched_competitors
          return render_failure competitor_not_found if competitors.empty?

          @results = @event.upload_track(round:, competitors:, file: params[:file])
          failed = @results.find { |result| result.errors.any? }
          return render_failure failed.errors.full_messages if failed

          broadcast_scoreboard
          render :show, status: :created
        end

        private

        def matched_competitors
          number = params[:assigned_number].to_s.strip
          return SpeedSkydivingCompetition::Competitor.none if number.blank?

          @event.competitors.where(assigned_number: number).ordered
        end

        def competitor_not_found
          t('speed_skydiving_competitions.track_upload.competitor_not_found', number: params[:assigned_number])
        end

        def render_failure(messages) = render_errors(messages, status: :unprocessable_content)
      end
    end
  end
end
