module Api
  class TracksController < ApplicationController
    def index
      @tracks = Track.public_track.order('id DESC')

      if params[:filter]
        @tracks = @tracks.where(
          user_profile_id: params[:filter][:profile_id]
        ) if params[:filter][:profile_id]
      end
      if params[:query] && params[:query][:term]
        @tracks = @tracks.where(
          'LOWER(comment) LIKE LOWER(?)', "%#{params[:query][:term]}%"
        )
      end
    end
  end
end
