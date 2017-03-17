module Tracks
  class PresenterBuilder
    def call(track, params, session)
      @track = track
      @params = params
      @session = session

      presenter_class.new(track, range, chart_preferences)
    end

    private

    attr_reader :track, :params, :session

    def range
      TrackRange.new(track, from: params[:f], to: params[:t])
    end

    def chart_preferences
      ChartsPreferences.new(session)
    end

    def presenter_class
      return TrackPresenter if track.flysight? || track.cyber_eye?
      RawTrackPresenter
    end
  end
end
