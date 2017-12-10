# == Schema Information
#
# Table name: competitors
#
#  id          :integer          not null, primary key
#  event_id    :integer
#  user_id     :integer
#  created_at  :datetime
#  updated_at  :datetime
#  wingsuit_id :integer
#  name        :string(510)
#  section_id  :integer
#  profile_id  :integer
#

class Competitor < ApplicationRecord
  include EventOngoingValidation

  belongs_to :event, touch: true
  belongs_to :section
  belongs_to :profile
  belongs_to :suit

  has_many :event_tracks, dependent: :restrict_with_error

  validates :suit, :event, :section, :profile, presence: true

  delegate :name, to: :profile, allow_nil: true
  delegate :country_id, to: :profile, allow_nil: true
  delegate :country_name, to: :profile, allow_nil: true
  delegate :country_code, to: :profile, allow_nil: true
  delegate :name, to: :suit, prefix: true, allow_nil: true
end
