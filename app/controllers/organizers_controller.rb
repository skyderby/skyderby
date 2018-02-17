class OrganizersController < ApplicationController
  before_action :authorize_organizable

  def new
    @organizer = organizable.organizers.new

    respond_to do |format|
      format.js
    end
  end

  def create
    @organizer = organizable.organizers.new organizer_params

    if @organizer.save
      respond_to do |format|
        format.js
      end
    else
      respond_with_error
    end
  end

  def destroy
    @organizer = organizable.organizers.find(params[:id])

    if @organizer.destroy
      respond_to do |format|
        format.js
      end
    else
      respond_with_error
    end
  end

  private

  def respond_with_error
    respond_to do |format|
      format.js { render 'errors/ajax_errors', locals: { errors: @organizer.errors } }
    end
  end

  def organizer_params
    params.require(:organizer).permit(:profile_id)
  end

  def organizable
    @organizable ||= organizable_class.find(params["#{organizable_class.name.underscore}_id"])
  end

  def organizable_class
    @organizable_class ||= [Event, Tournament].detect { |c| params["#{c.name.underscore}_id"] }
  end

  def authorize_organizable
    authorize organizable, :update?
  end
end
