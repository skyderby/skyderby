class Track::Form
  delegate :suit, :location, to: :last_track, allow_nil: true

  def initialize(user:)
    @user = user
  end

  def activity = last_track&.kind || 'skydive'

  def visibility = last_track&.visibility || 'public_track'

  def add_to_logbook? = last_track&.jump.present?

  private

  def last_track
    return @last_track if defined?(@last_track)

    @last_track = Track.where(owner: @user).order(created_at: :desc).first
  end
end
