class Api::V1::PerformanceCompetitions::CompetitorsController < Api::ApplicationController
  include Api::PerformanceCompetitionScoped
  include Api::EventManagement
  include PerformanceCompetitionBroadcasts
  include CompetitorProfileParams

  before_action :set_competitor, only: %i[update destroy]

  def create
    @competitor = @event.competitors.new
    save_competitor(status: :created)
  end

  def update
    save_competitor(status: :ok)
  end

  def destroy
    if @competitor.destroy
      broadcast_scoreboards
      head :no_content
    else
      render_record_errors @competitor
    end
  end

  private

  def set_competitor
    @competitor = @event.competitors.find(params[:id])
  end

  def save_competitor(status:)
    @competitor.assign_attributes(competitor_params)
    return render_record_errors(@competitor) unless team_belongs_to_event?

    if @competitor.save
      broadcast_scoreboards
      render :show, status:
    else
      render_record_errors @competitor
    end
  end

  def team_belongs_to_event?
    return true if @competitor.team_id.blank? || @event.teams.exists?(id: @competitor.team_id)

    @competitor.errors.add(:team, :invalid)
    false
  end

  def competitor_params
    permitted = params.require(:competitor).permit(
      :assigned_number, :category_id, :suit_id, :team_id, :profile_id, :alias_id, :photo,
      profile_attributes: %i[name country_id]
    )
    permitted[:section_id] = permitted.delete(:category_id) if permitted.key?(:category_id)

    resolve_profile(permitted)
  end
end
