class OrganizersController < ApplicationController
  before_action :set_organizable
  before_action :authorize_organizable

  def new
    @organizer = @organizable.organizers.new
  end

  def create
    @organizer = @organizable.organizers.new organizer_params

    if @organizer.save
      broadcast_organizers_update
    else
      respond_with_error @organizer
    end
  end

  def destroy
    @organizer = @organizable.organizers.find(params[:id])

    if @organizer.destroy
      broadcast_organizers_update
    else
      respond_with_error @organizer
    end
  end

  private

  def broadcast_organizers_update
    Turbo::StreamsChannel.broadcast_replace_to(
      [@organizable, :organizers, :editable],
      target: "#{@organizable.class.name.underscore}_#{@organizable.id}_organizers",
      partial: 'organizers/list',
      locals: { organizable: @organizable, editable: !@organizable.finished? }
    )

    Turbo::StreamsChannel.broadcast_replace_to(
      [@organizable, :organizers, :read_only],
      target: "#{@organizable.class.name.underscore}_#{@organizable.id}_organizers",
      partial: 'organizers/list',
      locals: { organizable: @organizable, editable: false }
    )
  end

  def organizer_params
    params.require(:organizer).permit(:user_id)
  end

  def set_organizable
    @organizable = organizable_class.find(params["#{organizable_class.name.underscore}_id"])
  end

  def organizable_class
    @organizable_class ||=
      [Event, SpeedSkydivingCompetition, Tournament]
      .detect { |c| params["#{c.name.underscore}_id"] }
  end

  def authorize_organizable
    respond_not_authorized unless @organizable.editable?
  end
end
