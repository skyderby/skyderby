class Jump < ApplicationRecord
  TRACK_MATCH_WINDOW = 15.minutes
  REUPLOAD_WINDOW = 1.minute
  SUGGESTIONS_LIMIT = 20

  enum :kind, { skydive: 0, base: 1 }
  enum :object_type, { building: 0, antenna: 1, span: 2, earth: 3 }, prefix: :object, validate: { allow_nil: true }
  enum :wind_strength, { calm: 0, light: 1, medium: 2, strong: 3 }, prefix: :wind, validate: { allow_nil: true }
  enum :wind_direction, { front: 0, back: 1, left: 2, right: 3 }, prefix: :wind_from, validate: { allow_nil: true }

  belongs_to :profile, inverse_of: :jumps
  belongs_to :track, optional: true, inverse_of: :jump
  belongs_to :place, optional: true
  belongs_to :suit, optional: true

  validates :jumped_at, presence: true
  validates :number, numericality: { only_integer: true, greater_than: 0 }, allow_nil: true
  validates :exit_altitude, :deployment_altitude, numericality: { only_integer: true }, allow_nil: true
  validates :freefall_seconds, :canopy_seconds,
            numericality: { only_integer: true, greater_than_or_equal_to: 0 },
            allow_nil: true

  scope :kept, -> { where(deleted_at: nil) }
  scope :chronologically, -> { order(jumped_at: :desc, id: :desc) }
  scope :numbered, -> { where.not(number: nil) }

  delegate :name, to: :suit, allow_nil: true, prefix: true

  def place_label = place&.name || place_name

  def discard = update!(deleted_at: Time.current, track: nil)

  def renumber_following
    return false if number.nil?

    transaction do
      following.each.with_index(number + 1) { |jump, next_number| jump.update!(number: next_number) }
    end
    true
  end

  def suggestions_for(attribute)
    self.class.kept.where(profile_id:, kind:).where.not(attribute => [nil, ''])
        .distinct.order(attribute).limit(SUGGESTIONS_LIMIT).pluck(attribute)
  end

  private

  def following
    self.class.kept.where(profile_id:, kind:)
        .where('(jumped_at, id) > (?, ?)', jumped_at, id)
        .order(:jumped_at, :id)
  end

  class << self
    def next_number(profile, kind)
      latest = profile.jumps.kept.where(kind:).maximum(:number)
      latest && (latest + 1)
    end

    def record_track(track)
      kind = track.place_kind
      jumped_at = track.exited_at || track.recorded_at
      jump = track.jump || matching(track.pilot, kind, jumped_at) || track.pilot.jumps.new(kind:, jumped_at:)
      jump.number ||= number_for(track.pilot, kind, jumped_at)
      jump.track = track
      jump.assign_attributes(attributes_from(track).select { |name, _value| jump[name].blank? })
      jump.save!
      jump
    end

    private

    def matching(profile, kind, jumped_at)
      candidates = profile.jumps.kept.where(kind:)
      candidates
        .where(track_id: nil, jumped_at: around(jumped_at, TRACK_MATCH_WINDOW))
        .or(candidates.where(jumped_at: around(jumped_at, REUPLOAD_WINDOW)))
        .min_by { |jump| (jump.jumped_at - jumped_at).abs }
    end

    def around(time, window) = (time - window)..(time + window)

    def number_for(profile, kind, jumped_at)
      latest = profile.jumps.kept.where(kind:).numbered.order(:jumped_at, :id).last
      next_number(profile, kind) if latest && jumped_at > latest.jumped_at
    end

    def attributes_from(track)
      {
        'place_id' => track.place_id,
        'place_name' => track.location,
        'suit_id' => track.suit_id,
        'exit_altitude' => track.exit_altitude,
        'deployment_altitude' => track.deployment_altitude,
        'freefall_seconds' => seconds_between(track.exited_at, track.deployed_at),
        'canopy_seconds' => seconds_between(track.deployed_at, track.landed_at)
      }
    end

    def seconds_between(from, to)
      (to - from).round if from && to
    end
  end
end
