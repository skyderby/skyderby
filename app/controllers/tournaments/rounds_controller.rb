class Tournaments::RoundsController < ApplicationController
  before_action :set_tournament_round, only: [:show, :edit, :update, :destroy]

  load_resource :tournament

  # GET /tournament_rounds
  # GET /tournament_rounds.json
  def index
    @tournament_rounds = @tournament.rounds.order(:order)
  end

  # GET /tournament_rounds/1
  # GET /tournament_rounds/1.json
  def show
  end

  # GET /tournament_rounds/new
  def new
    @tournament_round = @tournament.rounds.new
  end

  # GET /tournament_rounds/1/edit
  def edit
  end

  # POST /tournament_rounds
  # POST /tournament_rounds.json
  def create
    @tournament_round = @tournament.rounds.new(tournament_round_params)

    respond_to do |format|
      if @tournament_round.save
        format.html { redirect_to tournament_rounds_path(@tournament), notice: 'Tournament round was successfully created.' }
        format.json { render action: 'show', status: :created, location: @tournament_round }
      else
        format.html { render action: 'new' }
        format.json { render json: @tournament_round.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /tournament_rounds/1
  # PATCH/PUT /tournament_rounds/1.json
  def update
    respond_to do |format|
      if @tournament_round.update(tournament_round_params)
        format.html { redirect_to @tournament_round, notice: 'Tournament round was successfully updated.' }
        format.json { head :no_content }
      else
        format.html { render action: 'edit' }
        format.json { render json: @tournament_round.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /tournament_rounds/1
  # DELETE /tournament_rounds/1.json
  def destroy
    @tournament_round.destroy
    respond_to do |format|
      format.html { redirect_to tournament_rounds_url }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_tournament_round
      @tournament_round = TournamentRound.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def tournament_round_params
      params.require(:tournament_round).permit(:order, :tournament_id)
    end
end
