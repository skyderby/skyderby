class Tournaments::CompetitorsController < ApplicationController
  before_action :set_tournament_competitor, only: [:show, :edit, :update, :destroy]
  
  load_resource :tournament
  before_filter :authorize_tournament

  # GET /tournament_competitors
  # GET /tournament_competitors.json
  def index
    @competitors = @tournament.competitors
  end

  # GET /tournament_competitors/1
  # GET /tournament_competitors/1.json
  def show
  end

  # GET /tournament_competitors/new
  def new
    @competitor = @tournament.competitors.new
  end

  # GET /tournament_competitors/1/edit
  def edit
  end

  # POST /tournament_competitors
  # POST /tournament_competitors.json
  def create
    @competitor = @tournament.competitors.new(tournament_competitor_params)

    respond_to do |format|
      if @competitor.save
        format.html { redirect_to tournament_competitor_path(@tournament, @competitor), notice: 'Tournament competitor was successfully created.' }
        format.json { render action: 'show', status: :created, location: @competitor }
      else
        format.html { render action: 'new' }
        format.json { render json: @competitor.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /tournament_competitors/1
  # PATCH/PUT /tournament_competitors/1.json
  def update
    respond_to do |format|
      if @competitor.update(tournament_competitor_params)
        format.html { redirect_to tournament_competitor_path(@tournament, @competitor), notice: 'Tournament competitor was successfully updated.' }
        format.json { head :no_content }
      else
        format.html { render action: 'edit' }
        format.json { render json: @competitor.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /tournament_competitors/1
  # DELETE /tournament_competitors/1.json
  def destroy
    @competitor.destroy
    respond_to do |format|
      format.html { redirect_to tournament_competitors_url }
      format.json { head :no_content }
    end
  end

  private

  # Use callbacks to share common setup or constraints between actions.
  def set_tournament_competitor
    @competitor = TournamentCompetitor.find(params[:id])
  end

  # Never trust parameters from the scary internet, only allow the white list through.
  def tournament_competitor_params
    params.require(:tournament_competitor).permit(:tournament_id, :profile_id, :wingsuit_id)
  end

  def authorize_tournament
    authorize! :update, @tournament
  end
end
