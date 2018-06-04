module EventScoped
  extend ActiveSupport::Concern

  included do
    before_action :set_result_mode
  end

  def respond_with_scoreboard
    create_scoreboard(params[:event_id], @display_raw_results)
    render template: 'events/update_scoreboard'
  end

  def respond_with_errors(errors)
    respond_to do |format|
      format.js do
        render template: 'errors/ajax_errors',
               locals: { errors: errors },
               status: :unprocessable_entity
      end
      format.json { render json: errors, status: :unprocessable_entity }
    end
  end

  def create_scoreboard(event_id, display_raw_results)
    load_event(event_id)
    @scoreboard = Events::Scoreboards.for(@event, display_raw_results)
  end

  def load_event(event_id)
    @event = Event.includes(
      organizers: [:organizable, { user: :profile }],
      sponsors: :sponsorable,
      sections: [
        { event_tracks: :competitor },
        { competitors: [
          { suit: :manufacturer },
          { profile: :country },
          { event_tracks: :round }
        ] }
      ]
    ).find(event_id)
  end

  def set_result_mode
    @display_raw_results = params[:display_raw_results] == 'true'
  end

  def authorize_event
    return if EventPolicy.new(current_user, @event).update?
    raise Pundit::NotAuthorizedError
  end

  def set_event
    @event ||= Event.find(params[:event_id])
  end
end
