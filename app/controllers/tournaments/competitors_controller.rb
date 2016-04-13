class Tournaments::CompetitorsController < ApplicationController
  before_action :set_tournament_competitor, only: [:show, :edit, :update, :destroy]

  # GET /tournament_competitors
  # GET /tournament_competitors.json
  def index
    @competitors = TournamentCompetitor.where(tournament_id: params[:tournament_id])
  end

  # GET /tournament_competitors/1
  # GET /tournament_competitors/1.json
  def show
  end

  # GET /tournament_competitors/new
  def new
    @tournament_competitor = TournamentCompetitor.new
  end

  # GET /tournament_competitors/1/edit
  def edit
  end

  # POST /tournament_competitors
  # POST /tournament_competitors.json
  def create
    @tournament_competitor = TournamentCompetitor.new(tournament_competitor_params)

    respond_to do |format|
      if @tournament_competitor.save
        format.html { redirect_to @tournament_competitor, notice: 'Tournament competitor was successfully created.' }
        format.json { render action: 'show', status: :created, location: @tournament_competitor }
      else
        format.html { render action: 'new' }
        format.json { render json: @tournament_competitor.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /tournament_competitors/1
  # PATCH/PUT /tournament_competitors/1.json
  def update
    respond_to do |format|
      if @tournament_competitor.update(tournament_competitor_params)
        format.html { redirect_to @tournament_competitor, notice: 'Tournament competitor was successfully updated.' }
        format.json { head :no_content }
      else
        format.html { render action: 'edit' }
        format.json { render json: @tournament_competitor.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /tournament_competitors/1
  # DELETE /tournament_competitors/1.json
  def destroy
    @tournament_competitor.destroy
    respond_to do |format|
      format.html { redirect_to tournament_competitors_url }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_tournament_competitor
      @tournament_competitor = TournamentCompetitor.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def tournament_competitor_params
      params.require(:tournament_competitor).permit(:tournament_id, :user_profile_id, :wingsuit_id)
    end
end
