class TournamentMatchesController < ApplicationController
  before_action :set_tournament_match, only: [:show, :edit, :update, :destroy]

  # GET /tournament_matches
  # GET /tournament_matches.json
  def index
    @tournament_matches = TournamentMatch.all
  end

  # GET /tournament_matches/1
  # GET /tournament_matches/1.json
  def show
  end

  # GET /tournament_matches/new
  def new
    @tournament_match = TournamentMatch.new
  end

  # GET /tournament_matches/1/edit
  def edit
  end

  # POST /tournament_matches
  # POST /tournament_matches.json
  def create
    @tournament_match = TournamentMatch.new(tournament_match_params)

    respond_to do |format|
      if @tournament_match.save
        format.html { redirect_to @tournament_match, notice: 'Tournament match was successfully created.' }
        format.json { render action: 'show', status: :created, location: @tournament_match }
      else
        format.html { render action: 'new' }
        format.json { render json: @tournament_match.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /tournament_matches/1
  # PATCH/PUT /tournament_matches/1.json
  def update
    respond_to do |format|
      if @tournament_match.update(tournament_match_params)
        format.html { redirect_to @tournament_match, notice: 'Tournament match was successfully updated.' }
        format.json { head :no_content }
      else
        format.html { render action: 'edit' }
        format.json { render json: @tournament_match.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /tournament_matches/1
  # DELETE /tournament_matches/1.json
  def destroy
    @tournament_match.destroy
    respond_to do |format|
      format.html { redirect_to tournament_matches_url }
      format.json { head :no_content }
    end
  end

  private

  def set_tournament_match
    @tournament_match = TournamentMatch.find(params[:id])
  end

  def tournament_match_params
    params.require(:tournament_match).permit(
      :tournament_round_id,
      :start_time,
      :gold_finals,
      :bronze_finals
    )
  end
end
