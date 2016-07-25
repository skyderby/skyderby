class SponsorsController < ApplicationController
  before_action :set_sponsor, only: [:destroy]

  before_filter :load_sponsorable
  before_filter :authorize_sponsorable

  def new
    @sponsor = Sponsor.new
  end

  def create
    @sponsor = @sponsorable.sponsors.new sponsor_params

    if @sponsor.save
      @sponsor
    else
      respond_to do |format|
        format.js { render template: 'errors/ajax_errors', locals: {errors: @sponsor.errors} }
        format.json { render json: @sponsor.errors, status: :unprocessible_entry }
      end
    end
  end

  def destroy
    if @sponsor.destroy
      respond_to do |format|
        format.js
        format.json { head :no_content }
      end
    else
      respond_to do |format|
        format.js { render template: 'errors/ajax_errors', locals: {errors: @sponsor.errors} }
        format.json { render json: @sponsor.errors, status: :unprocessible_entry }
      end
    end
  end

  private

  def set_sponsor
    @sponsor = Sponsor.find(params[:id])
  end

  def sponsor_params
    params.require(:sponsor).permit(:name, :website, :logo, :event_id)
  end

  def load_sponsorable
    klass = [Event, Tournament, VirtualCompetition].detect { |c| params["#{c.name.underscore}_id"] }
    @sponsorable = klass.find(params["#{klass.name.underscore}_id"])
  end

  def authorize_sponsorable
    authorize! :update, @sponsorable
  end
end
