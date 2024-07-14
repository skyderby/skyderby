class Api::V1::Tournaments::CompetitorsController < Api::ApplicationController
  before_action :set_tournament
  before_action :set_competitor, only: %i[update destroy]

  def create
    authorize @tournament, :update?
    @competitor = @tournament.competitors.new(competitor_params)

    if @competitor.save
      render
    else
      respond_with_errors(@competitor)
    end
  end

  def update

  end

  def destroy
    authorize @tournament, :update?

    if @competitor.destroy
      render
    else
      respond_with_errors(@competitor)
    end
  end

  private

  def set_tournament
    @tournament = Tournament.find(params[:tournament_id])
  end

  def set_competitor
    @competitor = @tournament.competitors.find(params[:id])
  end

  def competitor_params
    permitted_params = [
      :profile_id,
      :suit_id,
      :profile_attributes,
      { profile_attributes: [:name, :country_id] }
    ]

    params.require(:competitor).permit(permitted_params).tap do |attrs|
      attrs[:profile_attributes][:owner] = @tournament if attrs[:profile_attributes].present?
    end
  end
end
