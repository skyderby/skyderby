class SuitsController < ApplicationController
  include SuitsContext

  before_action :set_manufacturers, only: :index
  before_action :set_suit, only: [:show, :edit, :update, :destroy]

  def index
    authorize Suit

    @suits = Suits::Index.for(params)
  end

  def show
    authorize @suit

    if base_tab?
      @comparison = Suits::ExitComparison.new(@suit, show_params[:compare])
    else
      @scoreboard = suit_scoreboard
    end

    @tracks = Track.accessible
    @tracks = TrackFilter.new(show_params[:query]).apply(@tracks)
    @tracks =
      @tracks
      .where(suit: @suit)
      .accessible
      .order(recorded_at: :desc)
      .includes(
        :distance,
        :time,
        :speed,
        :video,
        place: :country,
        pilot: :owner
      ).page(page).per(50)
  end

  def new
    authorize Suit

    @suit = Suit.new
  end

  def edit
    authorize @suit
  end

  def create
    authorize Suit

    @suit = Suit.new(suit_params)

    if @suit.save
      redirect_to @suit, notice: 'Suit was successfully created.'
    else
      render action: 'new'
    end
  end

  def update
    authorize @suit

    if @suit.update(suit_params)
      redirect_to @suit, notice: 'Suit was successfully updated.'
    else
      render action: 'edit'
    end
  end

  def destroy
    authorize @suit

    @suit.destroy
    redirect_to suits_url
  end

  private

  def index_params
    params.permit(:manufacturer_id, :activity)
  end
  helper_method :index_params

  def show_params
    params.permit(:order, :page, :wind, :scoreboard_page, compare: [], query: [:kind])
  end

  def base_tab? = show_params.dig(:query, :kind) == 'base'

  def suit_scoreboard
    group = VirtualCompetition::Group.skydive_combined
    return if group.nil?

    group.suit_scoreboard(
      @suit,
      wind_cancellation: show_params[:wind].present?,
      pages: { @suit.kind => show_params[:scoreboard_page] }
    )
  end
  helper_method :show_params

  def set_suit
    @suit = Suit.includes(:manufacturer).find(params[:id])
  end

  def suit_params
    params.require(:suit).permit(
      :name,
      :manufacturer_id,
      :kind,
      :photo,
      :description
    )
  end
end
