module Api
  class TracksController < ApplicationController
    def index
      if params[:query] && params[:query][:term]
        @tracks = Track.where('LOWER(comment) LIKE LOWER(?) OR LOWER(name) LIKE LOWER(?)', 
                              "%#{params[:query][:term]}%", 
                              "%#{params[:query][:term]}%")
                       .order('id DESC')
      else
        @tracks = Track.public_track.order('id DESC')
      end
    end
  end
end
