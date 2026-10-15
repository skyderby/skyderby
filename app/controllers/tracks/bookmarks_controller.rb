module Tracks
  class BookmarksController < ApplicationController
    before_action :set_track
    before_action :require_registered_user

    def create
      @track.bookmark(user: Current.user)
      render_button
    end

    def destroy
      @track.unbookmark(user: Current.user)
      render_button
    end

    private

    def set_track
      @track = Track.find(params[:track_id])
      respond_not_authorized unless @track.viewable?
    end

    def require_registered_user
      redirect_to new_user_session_path unless Current.user.registered?
    end

    def render_button
      render turbo_stream: turbo_stream.replace(
        helpers.dom_id(@track, :bookmark),
        partial: 'tracks/bookmarks/button',
        locals: { track: @track }
      )
    end
  end
end
