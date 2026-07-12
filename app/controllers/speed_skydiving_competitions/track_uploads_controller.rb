class SpeedSkydivingCompetitions::TrackUploadsController < ApplicationController
  include SpeedSkydivingCompetitionScoped

  before_action :set_event
  before_action :authorize_event_update!

  def new; end

  def create
    return render_feedback([t('speed_skydiving_competitions.track_upload.round_missing')]) if params[:round_id].blank?

    round = @event.rounds.find(params[:round_id])
    competitors = matched_competitors

    if competitors.empty?
      return render_feedback(
        [t('speed_skydiving_competitions.track_upload.competitor_not_found', number: params[:assigned_number])]
      )
    end

    failed = upload_track_to(round, competitors)
    return render_feedback(failed.errors.full_messages) if failed

    broadcast_scoreboard
    head :no_content
  end

  private

  def matched_competitors
    number = params[:assigned_number].to_s.strip
    return SpeedSkydivingCompetition::Competitor.none if number.blank?

    @event.competitors.where(assigned_number: number).ordered
  end

  def upload_track_to(round, competitors)
    first, *rest = competitors.to_a
    failed = nil

    ActiveRecord::Base.transaction do
      first_result = @event.results.new(
        round:, competitor: first, track_attributes: { file: params[:file] }
      )
      unless first_result.save
        failed = first_result
        raise ActiveRecord::Rollback
      end

      rest.each do |competitor|
        result = @event.results.new(round:, competitor:, track_id: first_result.track_id)
        next if result.save

        failed = result
        raise ActiveRecord::Rollback
      end
    end

    failed
  end

  def render_feedback(messages)
    render turbo_stream: turbo_stream.update(
      'track-upload-feedback',
      partial: 'speed_skydiving_competitions/track_uploads/feedback',
      locals: { messages: }
    ), status: :unprocessable_content
  end
end
