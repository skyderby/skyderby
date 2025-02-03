class Boogie < ApplicationRecord
  self.table_name = 'events'

  include EventTrackVisibility

  enum :status, { draft: 0, published: 1, finished: 2, surprise: 3 }
  enum :rules, { speed_distance_time: 0, fai: 1, hungary_boogie: 2 }
  enum :visibility, { public_event: 0, unlisted_event: 1, private_event: 2 }

  belongs_to :responsible, class_name: 'User', inverse_of: :responsible_of_events

  belongs_to :place, optional: true

  has_many :sections, -> { order(:order) }, inverse_of: :event, dependent: :restrict_with_error
  has_many :competitors, inverse_of: :event, dependent: :restrict_with_error
  has_many :rounds, -> { order(:number) }, inverse_of: :event, dependent: :restrict_with_error
  has_many :teams, dependent: :restrict_with_error
  has_many :results, through: :rounds
  has_many :tracks, through: :results
  has_many :organizers, as: :organizable, dependent: :delete_all
  has_many :sponsors,
           -> { order(:created_at) },
           as: :sponsorable,
           dependent: :delete_all,
           inverse_of: :sponsorable

  validates :name, :range_from, :range_to, :starts_at, presence: true

  before_create do
    self.apply_penalty_to_score = false
  end

  delegate :name, :msl, to: :place, prefix: true, allow_nil: true

  after_initialize do
    self.range_from ||= 2500
    self.range_to ||= 1500
  end

  def active? = starts_at < Time.zone.now && !finished?

  private

  class << self
    def search(query)
      where('LOWER(name) LIKE ?', "%#{query.downcase}%")
    end
  end
end
