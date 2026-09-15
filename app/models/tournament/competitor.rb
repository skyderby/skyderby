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
  include CompetitorPhoto

  self.ignored_columns += %w[sponsor_logo_data]

  has_one_attached :sponsor_logo do |attachable|
    attachable.variant :medium, resize_to_limit: [400, 200], preprocessed: true
  end

  attachment_url :sponsor_logo
  validates_attachment :sponsor_logo, max_size: 2.megabytes,
                                      content_types: HasAttachments::IMAGE_CONTENT_TYPES + %w[image/svg+xml]
  include CompetitorAlias

  belongs_to :tournament
  belongs_to :profile
  belongs_to :suit

  has_many :match_slots, dependent: :restrict_with_error, class_name: 'Tournament::Match::Slot'
  has_many :qualification_jumps, dependent: :restrict_with_error

  accepts_nested_attributes_for :profile

  delegate :country_id, to: :profile, allow_nil: true
  delegate :country_name, to: :profile, allow_nil: true
  delegate :country_code, to: :profile, allow_nil: true
  delegate :name, to: :suit, prefix: true, allow_nil: true

  def profile_attributes=(attrs)
    attrs[:require_country] = attrs.key?(:country_id)

    super(attrs)
  end
end
