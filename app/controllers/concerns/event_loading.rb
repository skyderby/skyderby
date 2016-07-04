module EventLoading
  extend ActiveSupport::Concern

  def respond_with_scoreboard
    create_scoreboard(params[:event_id], params[:display_raw_results])
  end

  def respond_with_errors(errors)
    respond_to do |format|
      format.js { render template: 'errors/ajax_errors', locals: {errors: errors} }
      format.json { render json: errors, status: :unprocessible_entry }
    end
  end

  def create_scoreboard(event_id, display_raw_results)
    load_event(params[:event_id])
    @scoreboard = Events::ScoreboardFactory.new(@event, display_raw_results).create 
  end

  def load_event(event_id)
    @event = Event.includes(
      :rounds,
      sections: {competitors: [:wingsuit, 
                               {profile: :country}, 
                               {event_tracks: {round: :event_tracks}}]}
    ).find(event_id)
  end
end
