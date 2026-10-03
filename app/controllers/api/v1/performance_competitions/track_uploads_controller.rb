class Api::V1::PerformanceCompetitions::TrackUploadsController < Api::ApplicationController
  include Api::PerformanceCompetitionScoped
  include Api::EventManagement
  include PerformanceCompetitionBroadcasts

  def create
    return render_feedback([t('performance_competitions.track_upload.round_missing')]) if params[:round_id].blank?

    round = @event.rounds.find(params[:round_id])
    competitors = matched_competitors
    if competitors.empty?
      return render_feedback(
        [t('performance_competitions.track_upload.competitor_not_found', number: params[:assigned_number])]
      )
    end

    @results, failed = upload_track_to(round, competitors)
    return render_feedback(failed.errors.full_messages) if failed

    broadcast_scoreboards
    render :show, status: :created
  end

  private

  def matched_competitors
    number = params[:assigned_number].to_s.strip
    return [] if number.blank?

    @event.competitors.where(assigned_number: number).ordered.to_a
  end

  def upload_track_to(round, competitors)
    first, *rest = competitors
    results = []
    failed = nil

    ActiveRecord::Base.transaction do
      results << @event.results.new(round:, competitor: first, track_attributes: { file: params[:file] })
      rest.each { |competitor| results << @event.results.new(round:, competitor:) }

      results.each do |result|
        result.track ||= results.first.track
        next if result.save

        failed = result
        raise ActiveRecord::Rollback
      end
    end

    [results, failed]
  end

  def render_feedback(messages) = render_errors(messages, status: :unprocessable_content)
end
