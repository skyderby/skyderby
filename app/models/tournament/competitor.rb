# == Schema Information
#
# Table name: tournament_competitors
#
#  id                      :integer          not null, primary key
#  tournament_id           :integer
#  profile_id              :integer
#  suit_id                 :integer
#  created_at              :datetime         not null
#  updated_at              :datetime         not null
#  is_disqualified         :boolean
#  disqualification_reason :string
#

class Tournament::Competitor < ApplicationRecord
  attr_accessor :profile_attributes, :profile_mode

  belongs_to :tournament
  belongs_to :profile
  belongs_to :suit

  has_many :match_slots, dependent: :restrict_with_error, class_name: 'Tournament::Match::Slot'
  has_many :qualification_jumps, dependent: :restrict_with_error

  delegate :name, to: :profile, allow_nil: true
  delegate :country_id, to: :profile, allow_nil: true
  delegate :country_name, to: :profile, allow_nil: true
  delegate :country_code, to: :profile, allow_nil: true
  delegate :name, to: :suit, prefix: true, allow_nil: true

  before_validation :create_profile

  private

  def create_profile
    return if profile || profile_mode.to_sym == :select

    self.profile = Profile.create profile_attributes
  end
end
