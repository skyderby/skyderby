class SponsorsController < ApplicationController
  before_action :set_sponsor, only: [:destroy]

  before_filter :load_sponsorable
  before_filter :authorize_sponsorable

  def create
    @sponsor = @sponsorable.sponsors.new sponsor_params

    if @sponsor.save
      @sponsor
    else
      render json: @sponsor.errors, status: :unprocessible_entry
    end
  end

  def destroy
    @sponsor.destroy
    head :no_content
  end

  private

  def set_sponsor
    @sponsor = Sponsor.find(params[:id])
  end

  def sponsor_params
    params.require(:sponsor).permit(:name, :website, :logo, :event_id)
  end

  def load_sponsorable
    klass = [Event, Tournament].detect { |c| params["#{c.name.underscore}_id"] }
    @sponsorable = klass.find(params["#{klass.name.underscore}_id"])
  end

  def authorize_sponsorable
    authorize! :update, @sponsorable
  end
end
