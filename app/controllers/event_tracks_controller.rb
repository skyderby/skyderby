# encoding: utf-8
class EventTracksController < ApplicationController

  def create
    event = Event.find(params[:event_id])
    et = EventTrack.new :competitor => Competitor.find(et_params[:competitor_id]),
                   :track => Track.find(et_params[:track_id]),
                   :round => Round.find(et_params[:round_id]),
                   :result => et_params[:result]
    if et.save
      redirect_to event, :notice => 'Трек успешно прикреплен.'
    else
      redirect_to event, :alert => 'Возникла ошибка при обработке запроса'
    end
  end

  private
  def et_params
    params.require(:event_track).permit(:competitor_id, :track_id, :round_id, :result)
  end
end
