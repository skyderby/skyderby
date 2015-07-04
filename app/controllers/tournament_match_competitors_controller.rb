class TournamentMatchCompetitorsController < ApplicationController
  before_action :set_tournament_match_competitor, only: [:show, :edit, :update, :destroy]

  # GET /tournament_match_competitors
  # GET /tournament_match_competitors.json
  def index
    @tournament_match_competitors = TournamentMatchCompetitor.all
  end

  # GET /tournament_match_competitors/1
  # GET /tournament_match_competitors/1.json
  def show
  end

  # GET /tournament_match_competitors/new
  def new
    @tournament_match_competitor = TournamentMatchCompetitor.new
  end

  # GET /tournament_match_competitors/1/edit
  def edit
  end

  # POST /tournament_match_competitors
  # POST /tournament_match_competitors.json
  def create
    @tournament_match_competitor = TournamentMatchCompetitor.new(tournament_match_competitor_params)

    respond_to do |format|
      if @tournament_match_competitor.save
        format.html { redirect_to @tournament_match_competitor, notice: 'Tournament match competitor was successfully created.' }
        format.json { render action: 'show', status: :created, location: @tournament_match_competitor }
      else
        format.html { render action: 'new' }
        format.json { render json: @tournament_match_competitor.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /tournament_match_competitors/1
  # PATCH/PUT /tournament_match_competitors/1.json
  def update
    respond_to do |format|
      if @tournament_match_competitor.update(tournament_match_competitor_params)
        format.html { redirect_to @tournament_match_competitor, notice: 'Tournament match competitor was successfully updated.' }
        format.json { head :no_content }
      else
        format.html { render action: 'edit' }
        format.json { render json: @tournament_match_competitor.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /tournament_match_competitors/1
  # DELETE /tournament_match_competitors/1.json
  def destroy
    @tournament_match_competitor.destroy
    respond_to do |format|
      format.html { redirect_to tournament_match_competitors_url }
      format.json { head :no_content }
    end
  end

  private

  def set_tournament_match_competitor
    @tournament_match_competitor = TournamentMatchCompetitor.find(params[:id])
  end

  def tournament_match_competitor_params
    params.require(:tournament_match_competitor).permit(
      :tournament_match_id,
      :tournament_competitor_id,
      :track_id,
      :result,
      :is_winner,
      :is_disqualified,
      :is_lucky_looser,
      :notes
    )
  end
end
