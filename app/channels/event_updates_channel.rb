class EventUpdatesChannel < ApplicationCable::Channel
  def subscribed
    stream_from "event_updates_#{params[:event_id]}"
  end
end
