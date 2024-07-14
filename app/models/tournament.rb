class Tournament < ApplicationRecord
  enum status: { draft: 0, published: 1, finished: 2, surprise: 3 }
  enum discipline: {
    time_until_intersection: 0,
    distance_in_time: 1,
    time: 2,
    distance: 3,
    speed: 4
  }

  belongs_to :responsible, class_name: 'User'

  belongs_to :place
  belongs_to :finish_line, class_name: 'Place::FinishLine'

  has_many :organizers, as: :organizable, dependent: :delete_all
  has_many :competitors, dependent: :restrict_with_error
  has_many :rounds, dependent: :restrict_with_error
  has_many :matches, through: :rounds

  has_many :qualification_rounds, dependent: :restrict_with_error
  has_many :qualification_jumps, through: :qualification_rounds

  has_many :sponsors, -> { order(:created_at) }, as: :sponsorable, inverse_of: :sponsorable

  delegate :name, to: :place, prefix: true, allow_nil: true

  after_initialize :set_default_values

  def active? = starts_at < Time.zone.now && !finished?

  # For compatibility with Event
  def finished? = false

  private

  def set_default_values
    return if persisted?

    self.bracket_size ||= 2
    self.starts_at ||= Time.zone.tomorrow
  end

  class << self
    def search(query)
      where('LOWER(name) LIKE ?', "%#{query.downcase}%")
    end
  end
end
