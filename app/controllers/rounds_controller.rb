# encoding: utf-8
class RoundsController < ApplicationController
  def create
    round_params = params[:round].permit(:name, :discipline)
    event = Event.find(params[:event_id])
    @round = Round.new :name => round_params[:name],
                        :discipline => Discipline.find(round_params[:discipline]),
                        :event => event

    respond_to do |format|
      if @round.save
        format.html { redirect_to event, notice: 'Round was successfully created.'}
        format.js {}
        format.json { render json: @round, status: :created, location: @round }
      else
        format.html { render action: "new"}
        format.json { render json: @round.errors, status: :unprocessable_entity }
      end
    end
  end
end
