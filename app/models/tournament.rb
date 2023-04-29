# == Schema Information
#
# Table name: tournaments
#
#  id                :integer          not null, primary key
#  name              :string(510)
#  place_id          :integer
#  discipline        :integer
#  created_at        :datetime         not null
#  updated_at        :datetime         not null
#  finish_start_lat  :decimal(15, 10)
#  finish_start_lon  :decimal(15, 10)
#  finish_end_lat    :decimal(15, 10)
#  finish_end_lon    :decimal(15, 10)
#  starts_at         :date
#  exit_lat          :decimal(15, 10)
#  exit_lon          :decimal(15, 10)
#  profile_id        :integer
#  bracket_size      :integer
#  has_qualification :boolean
#  responsible_id    :integer
#

class Tournament < ApplicationRecord
  enum status: { draft: 0, published: 1, finished: 2, surprise: 3 }
  enum discipline: {
    time: 0,
    distance: 1,
    speed: 2,
    distance_in_time: 3,
    time_until_intersection: 4
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

  has_many :sponsors, -> { order(:created_at) }, as: :sponsorable, inverse_of: :sponsorable, dependent: :destroy

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
