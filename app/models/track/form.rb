class Track::Form
  delegate :suit, :name, :location, to: :last_track, allow_nil: true

  def initialize(user:)
    @user = user
  end

  def activity = last_track&.kind || 'skydive'

  def visibility = last_track&.visibility || 'public_track'

  private

  def last_track
    return @last_track if defined?(@last_track)

    @last_track =
      if @user.registered?
        Track.where(owner: @user).order(created_at: :desc).first
      else
        @user.tracks.last_track
      end
  end
end
